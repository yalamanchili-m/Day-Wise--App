from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    height = Column(Integer)
    weight = Column(Integer)
    age = Column(Integer)
    gender = Column(String)
    diet_goal = Column(String)
    tdee = Column(Integer)  # Persisting the calculated calorie target