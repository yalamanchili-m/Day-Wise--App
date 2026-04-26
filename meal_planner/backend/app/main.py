from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .database import get_db, engine, Base
from .logic import (
    calculate_bmr,
    generate_monthly_plan,
    generate_grocery_list
)


# ============================================================
# FASTAPI INITIALIZATION
# ============================================================

app = FastAPI(title="MealMealMeal AI Planner")


# ============================================================
# CORS CONFIGURATION
# Allows frontend/backend communication across ports
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],        # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],        # Allow all headers
)


# ============================================================
# PYDANTIC REQUEST MODELS
# ============================================================

class UserMetrics(BaseModel):
    height: float
    weight: float
    age: int
    gender: str
    goal: str


class PlanData(BaseModel):
    plan: list


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the MealMealMeal API"
    }


# ============================================================
# GENERATE 30 DAY MEAL PLAN
# ============================================================

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)


@app.post("/generate-plan/")
def create_plan(
    metrics: UserMetrics,
    db: Session = Depends(get_db)
):

    target_cals = calculate_bmr(
        metrics.height,
        metrics.weight,
        metrics.age,
        metrics.gender,
        metrics.goal
    )

    try:
        plan = generate_monthly_plan(
            db,
            target_cals
        )
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Could not generate meal plan."
        )

    return {
        "daily_target_calories": round(target_cals, 2),
        "monthly_plan": plan
    }


# ============================================================
# GENERATE GROCERY LIST
# ============================================================

@app.post("/grocery-list/{week}")
def get_groceries(
    week: int,
    data: PlanData
):

    if week < 1 or week > 5:
        raise HTTPException(
            status_code=400,
            detail="Week must be between 1 and 5"
        )

    grocery_list = generate_grocery_list(
        data.plan,
        week
    )

    return grocery_list