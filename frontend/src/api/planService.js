import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export const generateMealPlan = async (userId, profileData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-plan/${userId}`, profileData);
    return response.data;
  } catch (error) {
    // Forward the specific error from FastAPI (422, 502, 500)
    const message = error.response?.data?.detail || "An unexpected error occurred";
    throw new Error(message);
  }
};
