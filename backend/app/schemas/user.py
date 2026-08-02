from pydantic import BaseModel, EmailStr, ConfigDict, Field


class UserCreate(BaseModel):
    full_name: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    bio: str = ""
    avatar_url: str = ""
    study_goal: str = ""
    theme_preference: str = "system"
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    study_goal: str | None = None


class UserSettingsUpdate(BaseModel):
    theme_preference: str | None = None


class UserStatsResponse(BaseModel):
    total_notes: int
    total_decks: int
    total_cards: int
    mastered_cards: int
    total_quizzes: int
    avg_quiz_score: float
    total_mindmaps: int
    total_documents: int