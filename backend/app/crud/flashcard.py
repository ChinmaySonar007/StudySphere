from sqlalchemy.orm import Session
from app.models.flashcard import FlashcardDeck, Flashcard
from app.schemas.flashcard import FlashcardDeckCreate, FlashcardCreate


def get_user_decks(db: Session, user_id: int) -> list[FlashcardDeck]:
    return db.query(FlashcardDeck).filter(FlashcardDeck.user_id == user_id).order_by(FlashcardDeck.created_at.desc()).all()


def get_deck(db: Session, deck_id: int) -> FlashcardDeck | None:
    return db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()


def create_deck(db: Session, user_id: int, deck_in: FlashcardDeckCreate) -> FlashcardDeck:
    deck = FlashcardDeck(
        user_id=user_id,
        title=deck_in.title,
        description=deck_in.description,
        document_id=deck_in.document_id,
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)

    for card_in in deck_in.cards:
        card = Flashcard(
            deck_id=deck.id,
            front=card_in.front,
            back=card_in.back,
            is_mastered=card_in.is_mastered,
        )
        db.add(card)

    db.commit()
    db.refresh(deck)
    return deck


def delete_deck(db: Session, deck: FlashcardDeck) -> None:
    db.delete(deck)
    db.commit()


def get_card(db: Session, card_id: int) -> Flashcard | None:
    return db.query(Flashcard).filter(Flashcard.id == card_id).first()


def add_card_to_deck(db: Session, deck_id: int, card_in: FlashcardCreate) -> Flashcard:
    card = Flashcard(
        deck_id=deck_id,
        front=card_in.front,
        back=card_in.back,
        is_mastered=card_in.is_mastered,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def toggle_card_mastery(db: Session, card: Flashcard) -> Flashcard:
    card.is_mastered = not card.is_mastered
    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card: Flashcard) -> None:
    db.delete(card)
    db.commit()
