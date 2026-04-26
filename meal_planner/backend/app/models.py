from sqlalchemy import Column, Integer, String, Float

try:
    from sqlalchemy.dialects.postgresql import JSONB
except ImportError:
    from sqlalchemy import JSON as JSONB

from .database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    # ============================================================
    # BASIC INFO
    # ============================================================

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    minutes = Column(Integer)


    # ============================================================
    # JSONB FIELDS
    # PostgreSQL optimized JSON storage
    # ============================================================

    tags = Column(JSONB)         
    nutrition = Column(JSONB)    
    ingredients = Column(JSONB)
    steps = Column(JSONB)


    # ============================================================
    # AI FILTERING / SEARCH FIELDS
    # ============================================================

    calories = Column(Float, index=True)
    protein_pdv = Column(Float)
    carbs_pdv = Column(Float)