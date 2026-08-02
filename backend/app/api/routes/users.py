from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user import (
    UserResponse,
    UserProfileUpdate,
    UserSettingsUpdate,
    UserStatsResponse,
)
from app.models.note import Note
from app.models.flashcard import FlashcardDeck, Flashcard
from app.models.quiz import Quiz
from app.models.mindmap import Mindmap
from app.models.document import Document

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user=Depends(get_current_user),
):
    return current_user


@router.put(
    "/profile",
    response_model=UserResponse,
)
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put(
    "/settings",
    response_model=UserResponse,
)
def update_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get(
    "/stats",
    response_model=UserStatsResponse,
)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = current_user.id

    total_notes = db.query(Note).filter(Note.user_id == user_id).count()
    
    decks = db.query(FlashcardDeck).filter(FlashcardDeck.user_id == user_id).all()
    deck_ids = [d.id for d in decks]
    total_decks = len(decks)

    total_cards = 0
    mastered_cards = 0
    if deck_ids:
        total_cards = db.query(Flashcard).filter(Flashcard.deck_id.in_(deck_ids)).count()
        mastered_cards = db.query(Flashcard).filter(Flashcard.deck_id.in_(deck_ids), Flashcard.is_mastered == True).count()

    quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).all()
    total_quizzes = len(quizzes)
    avg_score = 0.0
    if total_quizzes > 0:
        total_high = sum(q.high_score for q in quizzes)
        total_qs = sum(q.total_questions for q in quizzes)
        if total_qs > 0:
            avg_score = round((total_high / total_qs) * 100, 1)

    total_mindmaps = db.query(Mindmap).filter(Mindmap.user_id == user_id).count()
    total_documents = db.query(Document).filter(Document.user_id == user_id).count()

    return UserStatsResponse(
        total_notes=total_notes,
        total_decks=total_decks,
        total_cards=total_cards,
        mastered_cards=mastered_cards,
        total_quizzes=total_quizzes,
        avg_quiz_score=avg_score,
        total_mindmaps=total_mindmaps,
        total_documents=total_documents,
    )