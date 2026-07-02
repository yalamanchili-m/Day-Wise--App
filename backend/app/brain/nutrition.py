from app.schemas.user import UserProfile


ACTIVITY_FACTORS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_CALORIE_ADJUSTMENTS = {
    "lose": -400,
    "maintain": 0,
    "gain": 300,
}


def calculate_tdee(profile: UserProfile) -> int:
    if profile.gender.lower() == "male":
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    else:
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161

    activity_factor = ACTIVITY_FACTORS.get(profile.activity_level, ACTIVITY_FACTORS["moderate"])
    goal_adjustment = GOAL_CALORIE_ADJUSTMENTS.get(profile.diet_goal, 0)
    return max(int(round(bmr * activity_factor + goal_adjustment)), 1200)
