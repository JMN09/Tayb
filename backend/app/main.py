# backend/app/main.py
from fastapi import FastAPI
from app.api import users
from app.models import Base
from app.core.database import engine

app = FastAPI(
    title="Tayib API",
    description="FastAPI backend for the Tayib web application",
    version="0.1.0"
)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "Welcome to Tayib API"}
