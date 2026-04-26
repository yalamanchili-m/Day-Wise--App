from fastapi import APIRouter
from app.database import get_db
from app.schemas.finance import IncomeCreate
from typing import Optional

router = APIRouter(prefix="/api/finance/income", tags=["Income"])

@router.get("/")
def get_income(start_date: Optional[str] = None, end_date: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if start_date and end_date:
            cursor.execute(
                "SELECT * FROM income WHERE date BETWEEN %s AND %s ORDER BY date DESC",
                (start_date, end_date)
            )
        else:
            cursor.execute("SELECT * FROM income ORDER BY date DESC")
        income = cursor.fetchall()
    return income

@router.post("/")
def create_income(income: IncomeCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO income (amount, source, description, date) VALUES (%s, %s, %s, %s) RETURNING id",
            (income.amount, income.source, income.description, income.date)
        )
        income_id = cursor.fetchone()['id']
    return {"id": income_id, "message": "Income added"}