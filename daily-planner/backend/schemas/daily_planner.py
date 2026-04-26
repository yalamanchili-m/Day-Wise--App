from pydantic import BaseModel
from datetime import date
from typing import Optional

class TaskCreate(BaseModel):
    name: str
    start_time: float
    end_time: float
    date: str

class TaskUpdate(BaseModel):
    name: str
    start_time: float
    end_time: float

class NoteCreate(BaseModel):
    content: str

class TrackerCreate(BaseModel):
    tracker_type: str
    value: str
    date: str