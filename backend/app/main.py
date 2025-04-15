# backend/app/main.py
from fastapi import FastAPI
from app.api import users, restaurants, auth, chat
from app.models import Base
from app.core.database import engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os


app = FastAPI(
    title="Tayib API",
    description="FastAPI backend for the Tayib web application",
    version="0.1.0"
)

app.mount("/assets", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "assets")), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] to be more strict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
app.include_router(auth.router, tags=["auth"]) 
app.include_router(chat.router, tags=["tayb.ai"])

@app.get("/")
def root():
    return {"message": "Welcome to Tayib API"}
