import json
from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizQuestion
from app.schemas.quiz import QuizCreate


def get_user_quizzes(db: Session, user_id: int) -> list[Quiz]:
    return db.query(Quiz).filter(Quiz.user_id == user_id).order_by(Quiz.created_at.desc()).all()


def get_quiz(db: Session, quiz_id: int) -> Quiz | None:
    return db.query(Quiz).filter(Quiz.id == quiz_id).first()


def create_quiz(db: Session, user_id: int, quiz_in: QuizCreate) -> Quiz:
    quiz = Quiz(
        user_id=user_id,
        title=quiz_in.title,
        document_id=quiz_in.document_id,
        total_questions=len(quiz_in.questions),
        high_score=0,
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    for q in quiz_in.questions:
        q_obj = QuizQuestion(
            quiz_id=quiz.id,
            question=q.question,
            options_json=json.dumps(q.options),
            correct_answer=q.correct_answer,
            explanation=q.explanation,
        )
        db.add(q_obj)

    db.commit()
    db.refresh(quiz)
    return quiz


def update_quiz_score(db: Session, quiz: Quiz, score: int) -> Quiz:
    if score > quiz.high_score:
        quiz.high_score = score
        db.commit()
        db.refresh(quiz)
    return quiz


def delete_quiz(db: Session, quiz: Quiz) -> None:
    db.delete(quiz)
    db.commit()
