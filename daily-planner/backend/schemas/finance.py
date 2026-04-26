from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: str

class IncomeCreate(BaseModel):
    amount: float
    source: str
    description: Optional[str] = None
    date: str

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: str  # Format: YYYY-MM