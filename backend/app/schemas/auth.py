from typing import Optional
from pydantic import BaseModel, EmailStr

from app.schemas.user import UserResponse


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str


class GoogleAuthRequest(BaseModel):
    token: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    sub: Optional[str] = None


class GitHubAuthRequest(BaseModel):
    code: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
