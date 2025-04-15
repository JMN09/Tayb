from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.models import User
from app.core.database import get_db

router = APIRouter()

class LoginIn(BaseModel):
    email: EmailStr
    password: str

def strip_password(u: User) -> dict:
    data = u.__dict__.copy()
    data.pop("password_hash", None)
    data.pop("_sa_instance_state", None)
    return data

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.password_hash != data.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad credentials")
    return strip_password(user)
