"""
EduGenie Saved Items Routes
Save, retrieve, and delete educational items (explanations, quizzes, summaries, learning paths).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, SavedItem
from ..schemas import SavedItemCreate, SavedItemResponse
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/api/saved", tags=["Saved Items"])


@router.get("", response_model=List[SavedItemResponse])
def get_saved_items(
    item_type: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve saved items for current user filtered by type and search term."""
    query = db.query(SavedItem).filter(SavedItem.user_id == current_user.id)

    if item_type and item_type.lower() != "all":
        query = query.filter(SavedItem.item_type == item_type.lower())

    if search:
        query = query.filter(
            (SavedItem.title.ilike(f"%{search}%")) | (SavedItem.content.ilike(f"%{search}%"))
        )

    items = query.order_by(SavedItem.created_at.desc()).all()
    return [SavedItemResponse.model_validate(item) for item in items]


@router.post("", response_model=SavedItemResponse)
def save_item(
    req: SavedItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save an explanation, quiz result, summary, or learning path item."""
    saved = SavedItem(
        user_id=current_user.id,
        item_type=req.item_type,
        title=req.title,
        content=req.content,
        metadata_json=req.metadata_json or {},
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return SavedItemResponse.model_validate(saved)


@router.delete("/{item_id}")
def delete_saved_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a saved item."""
    item = db.query(SavedItem).filter(
        SavedItem.id == item_id,
        SavedItem.user_id == current_user.id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Saved item not found")

    db.delete(item)
    db.commit()
    return {"message": "Saved item deleted successfully"}
