from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from datetime import date, timedelta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_analysis(db: Session = Depends(get_db)):
    today = date.today()
    yesterday = today - timedelta(days=1)

    today_expenses = db.query(models.Expense).filter(models.Expense.date == today).all()
    yesterday_expenses = db.query(models.Expense).filter(models.Expense.date == yesterday).all()

    today_total = sum(e.amount for e in today_expenses)
    yesterday_total = sum(e.amount for e in yesterday_expenses)

    return {
        "today_spending": today_total,
        "yesterday_spending": yesterday_total,
        "difference": today_total - yesterday_total
    }