from fastapi import FastAPI, Depends
from app.services.spoonacular import SpoonacularClient
from app.database import engine, Base

# Create tables in Postgres automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meal Planner AI - Module")

@app.get("/")
def read_root():
    return {"status": "Meal Planner Backend is Live"}

@app.get("/test-spoonacular")
def test_api():
    client = SpoonacularClient()
    # Testing with a 500 calorie search
    try:
        data = client.get_recipes_by_nutrients(target_calories=500)
        return {"message": "API Connection Successful", "sample_recipe": data[0]['title']}
    except Exception as e:
        return {"message": "API Connection Failed", "error": str(e)}