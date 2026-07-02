import React, { useState } from 'react';
import { Activity, Target, User as UserIcon } from 'lucide-react';

const ProfileForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    height: 175,
    weight: 70,
    age: 25,
    gender: 'male',
    diet_goal: 'maintain',
    activity_level: 'moderate',
    dietary_preference: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['height', 'weight', 'age'].includes(name) ? Number(value) : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <UserIcon className="text-blue-500" /> Your Health Profile
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Level</label>
          <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly Active</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <Target size={16} /> Diet Goal
        </label>
        <div className="flex gap-4 mt-2">
          {['lose', 'maintain', 'gain'].map(goal => (
            <label key={goal} className="flex-1 capitalize">
              <input type="radio" name="diet_goal" value={goal} checked={formData.diet_goal === goal} onChange={handleChange} className="mr-2" />
              {goal}
            </label>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {isLoading ? "Generating Your 30-Day Plan..." : "Generate Meal Plan"}
      </button>
    </form>
  );
};

export default ProfileForm;