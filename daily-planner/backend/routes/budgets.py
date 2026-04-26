from fastapi import APIRouter
from app.database import get_db
from app.schemas.finance import BudgetCreate

router = APIRouter(prefix="/api/finance/budgets", tags=["Budgets"])

@router.get("/{month}")
def get_budgets(month: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM budgets WHERE month = %s",
            (month,)
        )
        budgets = cursor.fetchall()
    return budgets

@router.post("/")
def create_budget(budget: BudgetCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO budgets (category, amount, month) 
            VALUES (%s, %s, %s)
            ON CONFLICT (category, month) 
            DO UPDATE SET amount = EXCLUDED.amount
            """,
            (budget.category, budget.amount, budget.month)
        )
    return {"message": "Budget saved"}

@router.get("/summary/{month}")
def get_monthly_summary(month: str):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Total expenses
        cursor.execute(
            "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE TO_CHAR(date, 'YYYY-MM') = %s",
            (month,)
        )
        total_expenses = cursor.fetchone()['total']
        
        # Total income
        cursor.execute(
            "SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE TO_CHAR(date, 'YYYY-MM') = %s",
            (month,)
        )
        total_income = cursor.fetchone()['total']
        
        # Expenses by category
        cursor.execute("""
            SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE TO_CHAR(date, 'YYYY-MM') = %s 
            GROUP BY category 
            ORDER BY total DESC
            """,
            (month,)
        )
        expenses_by_category = cursor.fetchall()
        
    return {
        "month": month,
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "balance": float(total_income - total_expenses),
        "expenses_by_category": expenses_by_category
    }