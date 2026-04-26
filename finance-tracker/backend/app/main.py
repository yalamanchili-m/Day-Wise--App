from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DB_PATH = "finance.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            source TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Finance database initialized")

init_db()

# Models
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

# Expenses API
@app.get("/api/expenses")
def get_expenses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses ORDER BY date DESC")
    expenses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return expenses

@app.post("/api/expenses")
def create_expense(expense: ExpenseCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)",
        (expense.amount, expense.category, expense.description, expense.date)
    )
    conn.commit()
    conn.close()
    return {"message": "Expense added"}

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return {"message": "Expense deleted"}

# Income API
@app.get("/api/income")
def get_income():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM income ORDER BY date DESC")
    income = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return income

@app.post("/api/income")
def create_income(income_data: IncomeCreate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO income (amount, source, description, date) VALUES (?, ?, ?, ?)",
        (income_data.amount, income_data.source, income_data.description, income_data.date)
    )
    conn.commit()
    conn.close()
    return {"message": "Income added"}

@app.get("/")
def root():
    return {"message": "Finance Tracker API Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)