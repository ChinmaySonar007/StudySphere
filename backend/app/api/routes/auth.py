from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas.user import UserCreate, UserLogin
from app.schemas.auth import AuthResponse, GoogleAuthRequest, GitHubAuthRequest
from app.schemas.token import RefreshTokenRequest

from app.services.auth_service import (
    register_user,
    login_user,
    google_authenticate_user,
    github_authenticate_user,
    refresh_access_token,
    logout,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return register_user(db, user)


@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    return login_user(db, user)


@router.post(
    "/google",
    response_model=AuthResponse,
)
def google_auth(
    body: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    return google_authenticate_user(db, body)


@router.post(
    "/github",
    response_model=AuthResponse,
)
def github_auth(
    body: GitHubAuthRequest,
    db: Session = Depends(get_db),
):
    return github_authenticate_user(db, body)




# Swagger Authorize Endpoint
@router.post("/token")
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = UserLogin(
        email=form_data.username,
        password=form_data.password,
    )

    return login_user(db, user)


@router.post("/refresh")
def refresh(
    body: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    return refresh_access_token(
        db,
        body.refresh_token,
    )


@router.post("/logout")
def logout_route(
    body: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    return logout(
        db,
        body.refresh_token,
    )