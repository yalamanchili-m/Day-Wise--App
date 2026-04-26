from pydantic import BaseModel
from typing import Optional
from datetime import date

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    note: Optional[str] = None
    type: Optional[str] = "expense"

class ExpenseResponse(ExpenseCreate):
    id: int
    date: date

    class Config:
        from_attributes = True