import requests
import os
from dotenv import load_dotenv

load_dotenv()

class SpoonacularClient:
    def __init__(self):
        self.api_key = os.getenv("SPOONACULAR_API_KEY")
        self.base_url = "https://api.spoonacular.com/recipes"

    def get_recipes_by_nutrients(self, target_calories: int, diet: str = None):
        """Fetches a pool of recipes that fit the calorie target."""
        params = {
            "apiKey": self.api_key,
            "minCalories": target_calories - 100,
            "maxCalories": target_calories + 100,
            "number": 10
        }
        if diet:
            params["diet"] = diet
            
        response = requests.get(f"{self.base_url}/findByNutrients", params=params)
        response.raise_for_status()
        return response.json()

    def get_recipe_info(self, recipe_id: int):
        """Fetches detailed info including ingredients for waste analysis."""
        url = f"{self.base_url}/{recipe_id}/information"
        params = {"apiKey": self.api_key, "includeNutrition": True}
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()