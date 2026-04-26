from fastapi import APIRouter
from app.database import get_db
from app.schemas.daily_planner import NoteCreate

router = APIRouter(prefix="/api/notes", tags=["Notes"])

@router.get("/")
def get_notes():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM notes ORDER BY created_at DESC")
        notes = cursor.fetchall()
    return notes

@router.post("/")
def create_note(note: NoteCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notes (content) VALUES (%s) RETURNING id",
            (note.content,)
        )
        note_id = cursor.fetchone()['id']
    return {"id": note_id, "message": "Note created"}

@router.delete("/{note_id}")
def delete_note(note_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM notes WHERE id = %s", (note_id,))
    return {"message": "Note deleted"}