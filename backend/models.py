from pydantic import BaseModel
from typing import Optional


class HistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[HistoryItem] = []


class ChatResponse(BaseModel):
    text: str
    table: Optional[list] = None
    draft_email: Optional[str] = None
    action_items: Optional[list] = None
