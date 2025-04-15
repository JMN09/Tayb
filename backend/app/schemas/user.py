# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_restaurant:bool

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_restaurant:bool
    class Config:
        orm_mode = True
