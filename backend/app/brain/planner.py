import time
import random

from app.services.spoonacular import SpoonacularClient
from app.models.meal import RecipeCache
from .nutrition import calculate_tdee


class MealAI:
    def __init__(self, db):
        self.db = db
        self.client = SpoonacularClient()

    @staticmethod
    def _recipe_payload(details):
        nutrients = details.get("nutrition", {}).get("nutrients", [])
        calories = next((n["amount"] for n in nutrients if n.get("name") == "Calories"), 0)
        ingredients = [
            {
                "name": ingredient.get("name", "").lower(),
                "amount": ingredient.get("amount", 0),
                "unit": ingredient.get("unit", ""),
                "aisle": ingredient.get("aisle", "Unknown"),
            }
            for ingredient in details.get("extendedIngredients", [])
        ]
        return {
            "recipe_id": details["id"],
            "title": details["title"],
            "calories": int(calories or 0),
            "ingredients": ingredients,
        }

    def get_or_fetch_recipe(self, recipe_id):
        """Checks DB cache before hitting Spoonacular. Ensures ingredients are stored."""
        cached = self.db.query(RecipeCache).filter(RecipeCache.recipe_id == recipe_id).first()
        if cached:
            return cached.raw_data

        # Rate limiting: adding a tiny sleep to be safe
        time.sleep(0.2)
        details = self.client.get_recipe_info(recipe_id)
        payload = self._recipe_payload(details)

        new_recipe = RecipeCache(
            recipe_id=recipe_id,
            raw_data=payload,
        )
        self.db.add(new_recipe)
        self.db.commit()
        self.db.refresh(new_recipe)
        return new_recipe.raw_data

    def score_recipe(self, recipe_item, target_cal, virtual_pantry):
        """
        The 'Brain' logic: Scores a recipe based on:
        1. Calorie Proximity (Primary)
        2. Ingredient Reuse (Secondary - Waste Reduction)
        3. Randomness (To ensure the plan isn't the same every time)
        """
        # 1. Calorie Score (Lower difference is better)
        cal_diff = abs(recipe_item["calories"] - target_cal)
        cal_score = max(0, 100 - (cal_diff / 5)) # Penalty for calorie deviation

        # 2. Waste Reduction Score (Check if title or basic info matches pantry)
        # Since we don't have full ingredients for the pool yet, we check the title
        reuse_score = 0
        for ing in virtual_pantry:
            if ing in recipe_item["title"].lower():
                reuse_score += 25 # Reward for matching a known ingredient

        # 3. Variety Factor
        variety_bonus = random.randint(0, 15)

        return cal_score + reuse_score + variety_bonus

    def generate_30_day_plan(self, user_id, profile):
        target_cal = calculate_tdee(profile)
        # We target the main meal (Lunch/Dinner) which is usually ~40% of daily intake
        per_meal_target = int(target_cal * 0.4)

        # 1. Fetch a broad pool of 50-100 candidates (Costs only 1 API point)
        recipe_pool = self.client.get_recipes_by_nutrients(
            per_meal_target,
            diet=profile.dietary_preference,
            number=50,
        )

        if not recipe_pool:
            return []

        full_plan = []
        virtual_pantry = set() # Track ingredients used in previous days

        for day in range(1, 31):
            # 2. Score all recipes in the pool for this specific day
            scored_pool = []
            for r in recipe_pool:
                score = self.score_recipe(r, per_meal_target, virtual_pantry)
                scored_pool.append((score, r))
            
            # 3. Pick the highest scoring recipe
            scored_pool.sort(key=lambda x: x[0], reverse=True)
            winner = scored_pool[0][1]

            # 4. Fetch full details (Cache-First)
            recipe_data = self.get_or_fetch_recipe(winner['id'])

            # 5. Update virtual pantry with ingredients from this meal (to influence tomorrow)
            # We take the first 3 main ingredients to avoid overwhelming the logic
            new_ings = [ingredient["name"] for ingredient in recipe_data["ingredients"][:3]]
            virtual_pantry.update(new_ings)

            # Keep pantry size manageable
            if len(virtual_pantry) > 10:
                virtual_pantry = set(list(virtual_pantry)[-10:])

            full_plan.append({
                "day": day,
                "recipe_id": recipe_data["recipe_id"],
                "title": recipe_data["title"],
                "calories": recipe_data["calories"],
                "ingredients": recipe_data["ingredients"],
            })

        # NOTE: We do NOT save to MealPlan here. 
        # main.py handles the DB insertion to avoid duplication.
        return full_plan
