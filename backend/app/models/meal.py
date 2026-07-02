from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    month_data = Column(JSON)  # Stores the 30-day array of recipes
    grocery_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ingredient_name = Column(String)
    quantity = Column(Float)
    expiry_date = Column(DateTime)

class RecipeCache(Base):
    __tablename__ = "recipe_cache"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, unique=True, index=True, nullable=False)
    raw_data = Column(JSON, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
