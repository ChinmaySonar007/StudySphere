import json
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.flashcard import (
    FlashcardDeckResponse,
    FlashcardDeckCreate,
    FlashcardResponse,
    FlashcardCreate,
    AIGenerateFlashcardsRequest,
)
from app.crud.flashcard import (
    get_user_decks,
    get_deck,
    create_deck,
    delete_deck,
    get_card,
    add_card_to_deck,
    toggle_card_mastery,
    delete_card,
)
from app.services.rag_service import query_rag_pipeline

router = APIRouter(
    prefix="/flashcards",
    tags=["Flashcards"],
)


@router.get("/decks", response_model=List[FlashcardDeckResponse])
def list_decks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_user_decks(db, current_user.id)


@router.get("/decks/{deck_id}", response_model=FlashcardDeckResponse)
def get_deck_detail(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deck = get_deck(db, deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return deck


@router.post("/decks", response_model=FlashcardDeckResponse, status_code=status.HTTP_201_CREATED)
def create_new_deck(
    deck_in: FlashcardDeckCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_deck(db, current_user.id, deck_in)


@router.delete("/decks/{deck_id}", status_code=status.HTTP_200_OK)
def remove_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deck = get_deck(db, deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    delete_deck(db, deck)
    return {"message": "Deck deleted successfully", "id": deck_id}


@router.post("/decks/{deck_id}/cards", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
def add_card(
    deck_id: int,
    card_in: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    deck = get_deck(db, deck_id)
    if not deck or deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found")
    return add_card_to_deck(db, deck_id, card_in)


@router.patch("/cards/{card_id}/toggle-mastery", response_model=FlashcardResponse)
def toggle_mastery(
    card_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    card = get_card(db, card_id)
    if not card or card.deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return toggle_card_mastery(db, card)


@router.delete("/cards/{card_id}", status_code=status.HTTP_200_OK)
def remove_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    card = get_card(db, card_id)
    if not card or card.deck.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    delete_card(db, card)
    return {"message": "Card deleted successfully", "id": card_id}


@router.post("/generate", response_model=FlashcardDeckResponse)
def generate_flashcards_ai(
    payload: AIGenerateFlashcardsRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    prompt = (
        f"Generate {payload.count} study flashcard Q&A pairs from the document context.\n"
        "Format each flashcard strictly like this:\n"
        "Q: [Question or concept]\n"
        "A: [Answer or definition]\n"
    )
    rag_result = query_rag_pipeline(
        db=db,
        user_id=current_user.id,
        query=prompt,
        document_id=payload.document_id,
        top_k=10,
    )

    answer_text = rag_result.get("answer", "")
    
    # Parse Q&A pairs from answer text
    cards = []
    q_a_blocks = re.findall(r'Q:\s*(.*?)\n+A:\s*(.*?)(?=\n+Q:|\Z)', answer_text, flags=re.DOTALL | re.IGNORECASE)
    
    for q_text, a_text in q_a_blocks:
        cards.append(FlashcardCreate(
            front=q_text.strip(),
            back=a_text.strip(),
            is_mastered=False
        ))

    if not cards:
        # Fallback parsing
        lines = [line.strip() for line in answer_text.split('\n') if line.strip()]
        for i in range(0, len(lines)-1, 2):
            if len(cards) >= payload.count:
                break
            cards.append(FlashcardCreate(
                front=lines[i].lstrip("-*123456789. "),
                back=lines[i+1].lstrip("-*123456789. "),
                is_mastered=False
            ))

    deck_title = payload.title or f"AI Flashcards ({len(cards)} Cards)"
    deck_in = FlashcardDeckCreate(
        title=deck_title,
        description=f"Auto-generated flashcards from document.",
        document_id=payload.document_id,
        cards=cards,
    )
    return create_deck(db, current_user.id, deck_in)
