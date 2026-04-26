from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import models
from datetime import date

router = APIRouter()

# DB connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ POST (ADD THIS IF MISSING)
@router.post("/")
def create_expense(expense: dict, db: Session = Depends(get_db)):
    new_expense = models.Expense(
        amount=expense["amount"],
        category=expense["category"],
        note=expense.get("note"),
        type=expense.get("type"),
        date=date.today()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


# ✅ GET (you already added)
@router.get("/")
def get_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).all()
@router.put("/expenses/{id}/settle")
def settle_expense(id: int, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.id == id).first()
    
    if not expense:
        return {"error": "Expense not found"}

    expense.is_settled = True
    db.commit()

    return {"message": "Marked as settled"}
from fastapi import HTTPException

@router.put("/expenses/{expense_id}/settle")
def settle_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.is_settled = not expense.is_settled
    db.commit()
    db.refresh(expense)

    return expense