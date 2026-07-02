import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

# Avoid inheriting a broken custom CA bundle that can interfere with HTTPS calls.
os.environ.pop("REQUESTS_CA_BUNDLE", None)
os.environ.pop("CURL_CA_BUNDLE", None)

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


class SpoonacularClient:
    def __init__(self):
        self.api_key = os.getenv("SPOONACULAR_API_KEY")
        self.base_url = "https://api.spoonacular.com/recipes"
        self.detail_cache = {}
        self.last_detail_request_at = 0.0
        self.min_detail_request_interval = 0.2

        if not self.api_key:
            raise RuntimeError("SPOONACULAR_API_KEY is not set in backend/.env")

    def get_recipes_by_nutrients(self, target_calories: int, diet: str | None = None, number: int = 4):
        """Fetches a pool of recipes that fit the calorie target."""
        params = {
            "apiKey": self.api_key,
            "minCalories": target_calories - 100,
            "maxCalories": target_calories + 100,
            "number": number,
        }
        if diet:
            params["diet"] = diet

        response = requests.get(
            f"{self.base_url}/findByNutrients",
            params=params,
            timeout=20,
        )
        response.raise_for_status()
        return response.json()

    def get_recipe_info(self, recipe_id: int):
        """Fetches detailed info including ingredients for waste analysis."""
        if recipe_id in self.detail_cache:
            return self.detail_cache[recipe_id]

        elapsed = time.monotonic() - self.last_detail_request_at
        if elapsed < self.min_detail_request_interval:
            time.sleep(self.min_detail_request_interval - elapsed)

        url = f"{self.base_url}/{recipe_id}/information"
        params = {"apiKey": self.api_key, "includeNutrition": True}
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
        self.last_detail_request_at = time.monotonic()
        payload = response.json()
        self.detail_cache[recipe_id] = payload
        return payload
