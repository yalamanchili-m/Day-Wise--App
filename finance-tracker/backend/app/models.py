from sqlalchemy import Column, Integer, String, Float, Date, Boolean, DateTime
from datetime import datetime
from .database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    note = Column(String)
    type = Column(String)

    # New fields
    is_settled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)