from sqlalchemy.orm import Session
from app.models.mindmap import Mindmap
from app.schemas.mindmap import MindmapCreate, MindmapUpdate


def get_user_mindmaps(db: Session, user_id: int) -> list[Mindmap]:
    return db.query(Mindmap).filter(Mindmap.user_id == user_id).order_by(Mindmap.updated_at.desc()).all()


def get_mindmap(db: Session, mindmap_id: int) -> Mindmap | None:
    return db.query(Mindmap).filter(Mindmap.id == mindmap_id).first()


def create_mindmap(db: Session, user_id: int, mindmap_in: MindmapCreate) -> Mindmap:
    mindmap = Mindmap(
        user_id=user_id,
        title=mindmap_in.title,
        nodes_json=mindmap_in.nodes_json,
        document_id=mindmap_in.document_id,
    )
    db.add(mindmap)
    db.commit()
    db.refresh(mindmap)
    return mindmap


def update_mindmap(db: Session, mindmap: Mindmap, mindmap_in: MindmapUpdate) -> Mindmap:
    update_data = mindmap_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mindmap, field, value)
    db.commit()
    db.refresh(mindmap)
    return mindmap


def delete_mindmap(db: Session, mindmap: Mindmap) -> None:
    db.delete(mindmap)
    db.commit()
