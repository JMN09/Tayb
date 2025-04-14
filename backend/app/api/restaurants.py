from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models import Restaurant
from app.core.database import get_db

router = APIRouter()

@router.get("/")
def get_all_restaurants(db: Session = Depends(get_db)):
    return [r.__dict__ for r in db.query(Restaurant).all()]