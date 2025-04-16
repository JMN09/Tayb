from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from ..models import Restaurant, Review
from ..schemas.review import ReviewCreate, ReviewResponse

router = APIRouter()

@router.get("/")
def read_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).all()

@router.get("/{restaurant_id}")
def read_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.get("/{restaurant_id}/reviews")
def read_restaurant_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    return reviews

@router.post("/{restaurant_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    restaurant_id: int, 
    review: ReviewCreate, 
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    db_review = Review(
        content=review.content,
        rating=review.rating,
        restaurant_id=restaurant_id,
        user_id=review.user_id
    )
    
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review