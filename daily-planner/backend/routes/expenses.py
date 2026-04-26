from fastapi import APIRouter
from app.database import get_db
from app.schemas.finance import ExpenseCreate
from typing import Optional

router = APIRouter(prefix="/api/finance/expenses", tags=["Expenses"])

@router.get("/")
def get_expenses(start_date: Optional[str] = None, end_date: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if start_date and end_date:
            cursor.execute(
                "SELECT * FROM expenses WHERE date BETWEEN %s AND %s ORDER BY date DESC",
                (start_date, end_date)
            )
        else:
            cursor.execute("SELECT * FROM expenses ORDER BY date DESC")
        expenses = cursor.fetchall()
    return expenses

@router.post("/")
def create_expense(expense: ExpenseCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO expenses (amount, category, description, date) VALUES (%s, %s, %s, %s) RETURNING id",
            (expense.amount, expense.category, expense.description, expense.date)
        )
        expense_id = cursor.fetchone()['id']
    return {"id": expense_id, "message": "Expense added"}

@router.delete("/{expense_id}")
def delete_expense(expense_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM expenses WHERE id = %s", (expense_id,))
    return {"message": "Expense deleted"}

@router.get("/categories")
def get_categories():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM expense_categories ORDER BY name")
        categories = [row['name'] for row in cursor.fetchall()]
    return {"categories": categories}