# backend/routes/chat.py
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from openai import AsyncOpenAI
from app.core.database import get_db
from app.models import Restaurant

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

class ChatIn(BaseModel):
    message: str

SYSTEM_TMPL = """
You are Tayb.ai, a helpful Lebanese restaurant assistant.
Here is the current restaurant catalog:
{catalog}
Only answer using that catalog.
"""

def build_catalog(db: Session) -> str:
    rows: list[Restaurant] = db.query(Restaurant).all()
    return "\n".join(
        f"- {r.name} | cuisine: {getattr(r.cuisine,'name', '')} | location: {r.location} | description: {r.description}"
        for r in rows
    )

@router.post("/chat")
async def chat(data: ChatIn, db: Session = Depends(get_db)):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Empty message")

    catalog_text = build_catalog(db)
    system_prompt = SYSTEM_TMPL.format(catalog=catalog_text)

    try:
        resp = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": data.message},
            ],
            temperature=0.7,
        )
        return {"reply": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
