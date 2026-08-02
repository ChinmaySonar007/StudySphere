from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Return a user by email.
    """
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """
    Return a user by ID.
    """
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def create_user(
    db: Session,
    user: UserCreate,
    hashed_password: str,
) -> User:
    """
    Create a new user.
    """

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user(
    db: Session,
    db_user: User,
) -> User:
    """
    Save updated user.
    """
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(
    db: Session,
    db_user: User,
):
    """
    Delete a user.
    """
    db.delete(db_user)
    db.commit()