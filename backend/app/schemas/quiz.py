from datetime import datetime
from pydantic import BaseModel


class QuizQuestionBase(BaseModel):
    question: str
    options: list[str]
    correct_answer: str
    explanation: str = ""


class QuizQuestionResponse(QuizQuestionBase):
    id: int
    quiz_id: int

    class Config:
        from_attributes = True


class QuizBase(BaseModel):
    title: str
    document_id: int | None = None


class QuizCreate(QuizBase):
    questions: list[QuizQuestionBase]


class QuizResponse(QuizBase):
    id: int
    user_id: int
    total_questions: int
    high_score: int
    created_at: datetime
    questions: list[QuizQuestionResponse] = []

    class Config:
        from_attributes = True


class AIGenerateQuizRequest(BaseModel):
    document_id: int
    title: str | None = None
    num_questions: int = 5


class SubmitQuizResultRequest(BaseModel):
    score: int
