# DayWise AI Meal Planner

DayWise is a full-stack meal planning application that generates a personalized 30-day nutrition plan from a user's profile. The current working version focuses on the meal-planning module: it calculates a daily calorie target, fetches recipe options, builds a month-long plan, stores the result, and presents both the meal plan and a consolidated grocery list in the frontend.

## Current Features

- User profile form for height, weight, age, gender, diet goal, activity level, and optional dietary preference.
- TDEE-based calorie target calculation using the user's biological and activity data.
- 30-day meal plan generation through a FastAPI backend.
- Spoonacular recipe lookup for calorie-matched meal options.
- Recipe detail caching to reduce repeated external API calls.
- Grocery list generation by aggregating ingredients from the generated meal plan.
- React frontend with tabs for viewing the meal plan and grocery list.
- Grocery list grouping by aisle with basic quantity normalization and check-off interaction.
- Plan persistence through SQLAlchemy models for users, meal plans, recipe cache, and inventory structure.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Lucide React icons

### Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Requests
- python-dotenv
- Spoonacular API integration

### Database

- SQLAlchemy-compatible database configured through `DATABASE_URL`
- The project is currently set up for a PostgreSQL-style URL, for example:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
```

## Application Flow

1. The user enters their health and diet details in the React frontend.
2. The frontend sends the profile to the backend endpoint:

```text
POST /generate-plan/{user_id}
```

3. The backend validates the profile with Pydantic.
4. The nutrition module calculates the user's TDEE and adjusts it for the selected goal.
5. The meal planner requests calorie-matched recipes from Spoonacular.
6. Recipes are scored using calorie proximity, ingredient reuse, and a small variety factor.
7. Detailed recipe data is fetched and cached in the database.
8. A 30-day meal plan is created and saved.
9. A grocery list is generated from the meal plan ingredients.
10. The frontend displays the calorie target, meal cards, and grocery list.

## Backend API

### Health Check

```text
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

### Generate Meal Plan

```text
POST /generate-plan/{user_id}
```

Example request body:

```json
{
  "height": 175,
  "weight": 70,
  "age": 25,
  "gender": "male",
  "diet_goal": "maintain",
  "activity_level": "moderate",
  "dietary_preference": "vegetarian"
}
```

Example response shape:

```json
{
  "status": "success",
  "plan_id": 1,
  "tdee": 2400,
  "plan": [],
  "grocery_list": []
}
```

## Environment Variables

Create a backend `.env` file with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

The frontend uses this optional environment variable:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If `VITE_API_BASE_URL` is not set, the frontend falls back to `http://127.0.0.1:8000`.

## Running the Project

### Backend

From the project root:

```bash
pip install -r requirements.txt
cd backend
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

FastAPI docs will be available at:

```text
http://127.0.0.1:8000/docs
```

### Frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

The Vite development server will show the local frontend URL in the terminal, usually:

```text
http://localhost:5173
```

## Current Status

The working application is currently centered on the AI meal planner. The day-wise task planner and finance tracker described in the original project idea are not implemented in the current codebase yet.

The frontend is no longer just the Vite starter screen. It now contains a DayWise AI interface with a health profile form, meal plan view, and grocery list view. The backend contains the main meal-planning logic, nutrition calculation, grocery aggregation, Spoonacular integration, and database models.

## Planned Improvements

- Add real user authentication instead of using a fixed `user_id`.
- Add saved plan history and plan retrieval endpoints.
- Add recipe detail views in the frontend.
- Add better grocery unit conversion and ingredient normalization.
- Add the day-wise planner module.
- Add the finance tracker module.
- Tighten CORS settings for production.
- Add automated tests for the backend planner and grocery aggregation logic.
