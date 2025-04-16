from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ReviewBase(BaseModel):
    content: str
    rating: int = Field(..., ge=1, le=5)

class ReviewCreate(ReviewBase):
    user_id: int

class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    user_id: int
    restaurant_id: int
    username: Optional[str] = None

    class Config:
        orm_mode = True 