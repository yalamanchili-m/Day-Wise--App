import React, { useState } from 'react';
import ProfileForm from './features/onboarding/ProfileForm';
import GroceryList from './features/plan/GroceryList';
import { generateMealPlan } from './api/planService';
import { Calendar, ShoppingCart, Info, RotateCcw } from 'lucide-react';

function App() {
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('plan');

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateMealPlan(1, formData);
      setPlanData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Calendar size={20} />
            </div>
            DayWise AI
          </h1>

          {planData && (
            <button
              onClick={() => {
                setPlanData(null);
                setActiveTab('plan');
              }}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium"
            >
              <RotateCcw size={16} />
              New Plan
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-center gap-3">
            <Info size={20} />
            {error}
          </div>
        )}

        {!planData ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900">
                Generate Your Strategy
              </h2>
              <p className="text-slate-500 mt-2">
                Enter your vitals to build a 30-day nutrition roadmap.
              </p>
            </div>

            <ProfileForm
              onSubmit={handleFormSubmit}
              isLoading={loading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
                  Target Calories
                </p>
                <p className="text-3xl font-black mt-1">
                  {planData.tdee}
                  <span className="text-lg font-normal"> kcal/day</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase">
                    Duration
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    30 Days
                  </p>
                </div>

                <Calendar className="text-blue-500" size={32} />
              </div>

              <div className="bg-white rounded-2xl p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase">
                    Total Items
                  </p>
                  <p className="text-xl font-bold text-slate-800">
                    {planData.grocery_list.length} Ingredients
                  </p>
                </div>

                <ShoppingCart className="text-emerald-500" size={32} />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl w-full max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('plan')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'plan'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Calendar size={18} />
                Meal Plan
              </button>

              <button
                onClick={() => setActiveTab('grocery')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'grocery'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShoppingCart size={18} />
                Grocery List
              </button>
            </div>

            {/* Content Area */}
            {activeTab === 'plan' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {planData.plan.map((day) => (
                  <div
                    key={day.day}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group cursor-default"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                        Day {day.day}
                      </div>

                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {day.calories}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {day.title}
                    </h3>

                    <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wide">
                      Main Dish • {day.ingredients.length} Ingredients
                    </p>

                    <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium italic">
                        Balanced Meal
                      </span>

                      <button className="text-blue-600 font-bold text-[10px] uppercase hover:underline">
                        View Recipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <GroceryList items={planData.grocery_list} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;