from fastapi import APIRouter
from app.database import get_db
from app.schemas.daily_planner import TrackerCreate

router = APIRouter(prefix="/api/trackers", tags=["Trackers"])

@router.get("/")
def get_trackers():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trackers ORDER BY created_at DESC")
        trackers = cursor.fetchall()
        
        result = {}
        for tracker in trackers:
            tracker_type = tracker['tracker_type']
            if tracker_type not in result:
                result[tracker_type] = []
            result[tracker_type].append({
                "date": tracker['date'].isoformat(),
                "value": tracker['value']
            })
    return result

@router.post("/")
def create_tracker(tracker: TrackerCreate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO trackers (tracker_type, value, date) 
            VALUES (%s, %s, %s)
            ON CONFLICT (tracker_type, date) 
            DO UPDATE SET value = EXCLUDED.value
            """,
            (tracker.tracker_type, tracker.value, tracker.date)
        )
    return {"message": "Tracker updated"}