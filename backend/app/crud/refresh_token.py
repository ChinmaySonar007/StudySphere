from datetime import datetime

from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


def create_refresh_token(
    db: Session,
    user_id: int,
    token: str,
    expires_at: datetime,
) -> RefreshToken:
    """
    Store a refresh token.
    """

    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
    )

    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)

    return refresh_token


def get_refresh_token(
    db: Session,
    token: str,
) -> RefreshToken | None:
    """
    Get refresh token from DB.
    """

    return (
        db.query(RefreshToken)
        .filter(RefreshToken.token == token)
        .first()
    )


def delete_refresh_token(
    db: Session,
    token: str,
):
    """
    Delete a single refresh token.
    """

    refresh_token = get_refresh_token(
        db,
        token,
    )

    if refresh_token:
        db.delete(refresh_token)
        db.commit()


def delete_all_user_tokens(
    db: Session,
    user_id: int,
):
    """
    Logout from all devices.
    """

    (
        db.query(RefreshToken)
        .filter(
            RefreshToken.user_id == user_id
        )
        .delete()
    )

    db.commit()


def cleanup_expired_tokens(
    db: Session,
):
    """
    Remove expired refresh tokens.
    """

    (
        db.query(RefreshToken)
        .filter(
            RefreshToken.expires_at < datetime.utcnow()
        )
        .delete()
    )

    db.commit()