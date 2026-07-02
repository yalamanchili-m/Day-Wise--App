from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from requests import RequestException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

# Import the Database setup
from app.database import Base, engine, get_db

# IMPORT ALL MODELS: This ensures SQLAlchemy registers them for table creation
from app.models.user import User
from app.models.meal import MealPlan

# Import Logic and Schemas
from app.brain.nutrition import calculate_tdee
from app.brain.planner import MealAI
from app.schemas.user import UserProfile
from app.services.grocery import generate_grocery_list

app = FastAPI(title="Day-Wise Meal Planner AI")

# --- CORS SETTINGS ---
# This allows your browser (Swagger/Frontend) to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE STARTUP ---
@app.on_event("startup")
def on_startup() -> None:
    # This creates users, meal_plans, and recipe_cache tables if they don't exist
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Meal Planner API is Online", "docs": "/docs"}


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/generate-plan/{user_id}")
def create_meal_plan(
    user_id: int,
    profile: UserProfile,
    db: Session = Depends(get_db),
) -> dict:
    try:
        # 1. Calculate the user's biological needs
        tdee = calculate_tdee(profile)

        # 2. Sync User Profile in Database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            user = User(id=user_id)
            db.add(user)

        user.height = profile.height
        user.weight = profile.weight
        user.age = profile.age
        user.gender = profile.gender
        user.diet_goal = profile.diet_goal
        user.tdee = int(round(tdee))
        
        # Flush ensures the user exists before we link a meal plan to them
        db.flush()

        # 3. Generate the 30-day plan using the AI Brain
        ai_engine = MealAI(db)
        generated_data = ai_engine.generate_30_day_plan(user_id, profile)
        
        if not generated_data:
            raise HTTPException(status_code=502, detail="The AI could not generate a valid meal plan.")

        # 4. Generate the Grocery List from the plan
        grocery_list = generate_grocery_list(generated_data)

        # 5. Persist the plan to the Database
        new_plan = MealPlan(
            user_id=user_id,
            month_data=generated_data,
            grocery_data=grocery_list,
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        return {
            "status": "success",
            "plan_id": new_plan.id,
            "tdee": user.tdee,
            "plan": generated_data,
            "grocery_list": new_plan.grocery_data,
        }

    except HTTPException as e:
        db.rollback()
        raise e
    except RequestException as exc:
        db.rollback()
        # This handles Spoonacular API timeouts/errors gracefully
        raise HTTPException(
            status_code=502,
            detail=f"External Meal API error: {str(exc)}",
        )
    except SQLAlchemyError as exc:
        db.rollback()
        # This handles Database connection issues
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(exc)}",
        )
    except Exception as exc:
        db.rollback()
        # Catch-all for any other logic errors
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(exc)}",
        )
