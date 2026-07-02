from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserProfile(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    height: float = Field(..., gt=0, description="Height in centimeters")
    weight: float = Field(..., gt=0, description="Weight in kilograms")
    age: int = Field(..., gt=0, lt=130)
    gender: str
    diet_goal: str
    activity_level: str = "moderate"
    dietary_preference: str | None = None

    @field_validator("gender")
    @classmethod
    def normalize_gender(cls, value: str) -> str:
        normalized = value.lower()
        allowed = {"male", "female"}
        if normalized not in allowed:
            raise ValueError(f"gender must be one of: {', '.join(sorted(allowed))}")
        return normalized

    @field_validator("diet_goal")
    @classmethod
    def normalize_goal(cls, value: str) -> str:
        normalized = value.lower()
        allowed = {"lose", "maintain", "gain"}
        if normalized not in allowed:
            raise ValueError(f"diet_goal must be one of: {', '.join(sorted(allowed))}")
        return normalized

    @field_validator("activity_level")
    @classmethod
    def normalize_activity_level(cls, value: str) -> str:
        normalized = value.lower()
        allowed = {"sedentary", "light", "moderate", "active", "very_active"}
        if normalized not in allowed:
            raise ValueError(f"activity_level must be one of: {', '.join(sorted(allowed))}")
        return normalized

    @field_validator("dietary_preference")
    @classmethod
    def normalize_dietary_preference(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.lower()
        return normalized or None
