# backend/routes/chat.py
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI   # ⬅️ new in openai‑python ≥ 1.0

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))  # keep key in .env

router = APIRouter()


class ChatIn(BaseModel):
    message: str


@router.post("/chat")
async def chat(data: ChatIn):
    try:
        resp = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": data.message}],
            temperature=0.7,
        )
        return {"reply": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
