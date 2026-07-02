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

        calories = next(
            (n["amount"] for n in nutrients if n.get("name") == "Calories"),
            0
        )

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
        """
        Checks DB cache before hitting Spoonacular.
        Ensures ingredients are stored.
        """
        cached = (
            self.db.query(RecipeCache)
            .filter(RecipeCache.recipe_id == recipe_id)
            .first()
        )

        if cached:
            return cached.raw_data

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

    def score_recipe(self, recipe_item, target_cal, virtual_pantry, selected_ids_this_week):
        """
        Enhanced scoring logic based on:
        1. Calorie proximity
        2. Ingredient reuse
        3. Repetition penalty
        4. Randomness / entropy
        """

        # ------------------------------
        # 1. Calorie Score
        # ------------------------------
        cal_diff = abs(recipe_item["calories"] - target_cal)

        cal_score = max(
            0,
            100 - (cal_diff / 5)
        )

        # ------------------------------
        # 2. Pantry Reuse Score
        # ------------------------------
        reuse_score = 0

        for ing in virtual_pantry:
            if ing in recipe_item["title"].lower():
                reuse_score += 25

        # ------------------------------
        # 3. Repetition Penalty
        # ------------------------------
        repetition_penalty = 0

        if recipe_item["id"] in selected_ids_this_week:
            repetition_penalty = -50

        # ------------------------------
        # 4. Randomness / Variety Bonus
        # ------------------------------
        randomness_bonus = random.randint(-15, 15)

        total_score = (
            cal_score
            + reuse_score
            + repetition_penalty
            + randomness_bonus
        )

        return total_score

    def generate_30_day_plan(self, user_id, profile):
        """
        Main planner logic.
        """

        target_cal = calculate_tdee(profile)

        per_meal_target = int(target_cal * 0.4)

        recipe_pool = self.client.get_recipes_by_nutrients(
            per_meal_target,
            diet=profile.dietary_preference,
            number=50,
        )

        if not recipe_pool:
            return []

        full_plan = []

        virtual_pantry = set()

        selected_ids_this_week = set()

        for day in range(1, 31):

            # Reset weekly repetition tracker every 7 days
            if day % 7 == 1:
                selected_ids_this_week.clear()

            scored_pool = []

            for recipe in recipe_pool:

                score = self.score_recipe(
                    recipe,
                    per_meal_target,
                    virtual_pantry,
                    selected_ids_this_week
                )

                scored_pool.append((score, recipe))

            scored_pool.sort(
                key=lambda x: x[0],
                reverse=True
            )

            winner = scored_pool[0][1]

            recipe_data = self.get_or_fetch_recipe(
                winner["id"]
            )

            selected_ids_this_week.add(
                winner["id"]
            )

            # Update pantry with top ingredients
            new_ingredients = [
                ingredient["name"]
                for ingredient in recipe_data["ingredients"][:3]
            ]

            virtual_pantry.update(new_ingredients)

            # Keep pantry manageable
            if len(virtual_pantry) > 10:
                virtual_pantry = set(
                    list(virtual_pantry)[-10:]
                )

            full_plan.append({
                "day": day,
                "recipe_id": recipe_data["recipe_id"],
                "title": recipe_data["title"],
                "calories": recipe_data["calories"],
                "ingredients": recipe_data["ingredients"],
            })

        return full_plan