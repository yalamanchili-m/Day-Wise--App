from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.schemas.daily_planner import TaskCreate, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("/")
def get_tasks(target_date: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM tasks WHERE date = %s ORDER BY start_time",
            (target_date,)
        )
        tasks = cursor.fetchall()
    return {"tasks": tasks}

@router.post("/")
def create_task(task: TaskCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tasks (name, start_time, end_time, date) VALUES (%s, %s, %s, %s) RETURNING id",
            (task.name, task.start_time, task.end_time, task.date)
        )
        task_id = cursor.fetchone()['id']
    return {"id": task_id, "message": "Task created"}

@router.put("/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE tasks SET name = %s, start_time = %s, end_time = %s WHERE id = %s",
            (task.name, task.start_time, task.end_time, task_id)
        )
    return {"message": "Task updated"}

@router.delete("/{task_id}")
def delete_task(task_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
    return {"message": "Task deleted"}