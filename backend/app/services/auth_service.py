import os
import json
import urllib.request
import urllib.parse
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

from app.crud.user import (
    get_user_by_email,
    create_user,
)

from app.crud.refresh_token import (
    create_refresh_token as save_refresh_token,
    get_refresh_token,
    delete_refresh_token,
)

from app.schemas.user import (
    UserCreate,
    UserLogin,
)
from app.schemas.auth import GoogleAuthRequest, GitHubAuthRequest




# -----------------------------
# Register
# -----------------------------

def register_user(
    db: Session,
    user: UserCreate,
):

    existing_user = get_user_by_email(
        db,
        user.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = create_user(
        db=db,
        user=user,
        hashed_password=hashed_password,
    )

    access_token = create_access_token(
        {
            "sub": new_user.email,
            "user_id": new_user.id,
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": new_user.email,
            "user_id": new_user.id,
        }
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    save_refresh_token(
        db=db,
        user_id=new_user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    return {
        "user": new_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }


# -----------------------------
# Login
# -----------------------------

def login_user(
    db: Session,
    user: UserLogin,
):

    db_user = get_user_by_email(
        db,
        user.email,
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        user.password,
        db_user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    save_refresh_token(
        db=db,
        user_id=db_user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    return {
        "user": db_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }


# -----------------------------
# Refresh Access Token
# -----------------------------

def refresh_access_token(
    db: Session,
    refresh_token: str,
):

    payload = verify_refresh_token(
        refresh_token
    )

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    stored_token = get_refresh_token(
        db,
        refresh_token,
    )

    if stored_token is None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token not found",
        )

    access_token = create_access_token(
        {
            "sub": payload["sub"],
            "user_id": payload["user_id"],
        }
    )

    return {
        "access_token": access_token,
        "token_type": "Bearer",
    }


# -----------------------------
# Logout
# -----------------------------

def logout(
    db: Session,
    refresh_token: str,
):

    delete_refresh_token(
        db,
        refresh_token,
    )

    return {
        "message": "Logged out successfully"
    }


# -----------------------------
# Google Authentication
# -----------------------------

def google_authenticate_user(
    db: Session,
    data: GoogleAuthRequest,
):
    email = data.email
    full_name = data.full_name

    if data.token:
        try:
            from jose import jwt
            unverified_claims = jwt.get_unverified_claims(data.token)
            if unverified_claims and "email" in unverified_claims:
                email = unverified_claims.get("email")
                full_name = unverified_claims.get("name") or full_name
        except Exception:
            pass

        if not email:
            try:
                userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
                req_g = urllib.request.Request(
                    userinfo_url,
                    headers={
                        "Authorization": f"Bearer {data.token}",
                        "Accept": "application/json",
                    },
                )
                with urllib.request.urlopen(req_g) as resp:
                    g_user = json.loads(resp.read().decode("utf-8"))
                    email = g_user.get("email")
                    full_name = g_user.get("name") or g_user.get("given_name")
            except Exception as e:
                print("Google UserInfo API Error:", e)

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Google authentication token or email is required",
        )


    db_user = get_user_by_email(db, email)

    if db_user is None:
        name_to_use = full_name if full_name else email.split("@")[0]
        random_password = hash_password(str(uuid.uuid4()))
        user_create = UserCreate(
            full_name=name_to_use[:100],
            email=email,
            password="GoogleAuthPassword123!",
        )
        db_user = create_user(
            db=db,
            user=user_create,
            hashed_password=random_password,
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    save_refresh_token(
        db=db,
        user_id=db_user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    return {
        "user": db_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }


# -----------------------------
# GitHub Authentication
# -----------------------------

def github_authenticate_user(
    db: Session,
    data: GitHubAuthRequest,
):
    email = data.email
    full_name = data.full_name

    if data.code:
        client_id = os.getenv("GITHUB_CLIENT_ID", "")
        client_secret = os.getenv("GITHUB_CLIENT_SECRET", "")
        if client_id and client_secret:
            try:
                token_url = "https://github.com/login/oauth/access_token"
                post_data = urllib.parse.urlencode({
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": data.code,
                }).encode("utf-8")

                req = urllib.request.Request(
                    token_url,
                    data=post_data,
                    headers={"Accept": "application/json", "User-Agent": "StudySphere-App"},
                )
                with urllib.request.urlopen(req) as resp:
                    token_resp = json.loads(resp.read().decode("utf-8"))

                access_token_gh = token_resp.get("access_token")
                if access_token_gh:
                    user_url = "https://api.github.com/user"
                    req_user = urllib.request.Request(
                        user_url,
                        headers={
                            "Authorization": f"Bearer {access_token_gh}",
                            "User-Agent": "StudySphere-App",
                            "Accept": "application/json",
                        },
                    )
                    with urllib.request.urlopen(req_user) as resp:
                        gh_user = json.loads(resp.read().decode("utf-8"))

                    email = gh_user.get("email")
                    full_name = gh_user.get("name") or gh_user.get("login")

                    if not email:
                        emails_url = "https://api.github.com/user/emails"
                        req_emails = urllib.request.Request(
                            emails_url,
                            headers={
                                "Authorization": f"Bearer {access_token_gh}",
                                "User-Agent": "StudySphere-App",
                                "Accept": "application/json",
                            },
                        )
                        with urllib.request.urlopen(req_emails) as resp:
                            emails_data = json.loads(resp.read().decode("utf-8"))
                            if isinstance(emails_data, list):
                                for em in emails_data:
                                    if em.get("primary") or em.get("verified"):
                                        email = em.get("email")
                                        break
            except Exception as e:
                print("GitHub Token Exchange Error:", e)

    if not email:
        raise HTTPException(
            status_code=400,
            detail="GitHub authorization code or email is required",
        )

    db_user = get_user_by_email(db, email)

    if db_user is None:
        name_to_use = full_name if full_name else email.split("@")[0]
        random_password = hash_password(str(uuid.uuid4()))
        user_create = UserCreate(
            full_name=name_to_use[:100],
            email=email,
            password="GitHubAuthPassword123!",
        )
        db_user = create_user(
            db=db,
            user=user_create,
            hashed_password=random_password,
        )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    refresh_token = create_refresh_token(
        {
            "sub": db_user.email,
            "user_id": db_user.id,
        }
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(days=7)
    )

    save_refresh_token(
        db=db,
        user_id=db_user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    return {
        "user": db_user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
    }
