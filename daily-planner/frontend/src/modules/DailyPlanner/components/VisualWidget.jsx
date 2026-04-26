import React from "react";

export default function VisualWidget({ trackerId, value, target, unit, icon, onUpdate }) {
  const filledCount = Math.floor((value / target) * 8);

  switch (trackerId) {
    case "water":
      return (
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">💧</div>
          <div className="flex justify-center gap-1 flex-wrap">
            {[...Array(Math.min(8, filledCount))].map((_, i) => (
              <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>💧</span>
            ))}
          </div>
          <div className="text-sm mt-2">{value} / {target} glasses</div>
        </div>
      );
    case "walk":
      return (
        <div className="text-center">
          <div className="text-5xl mb-2">🚶‍♀️</div>
          <div className="text-2xl font-bold">{Math.round(value)}</div>
          <div className="text-xs text-gray-500">steps today</div>
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={() => onUpdate(value + 500)} className="px-3 py-1 bg-green-500 text-white rounded-full text-xs">+500</button>
            <button onClick={() => onUpdate(value + 1000)} className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">+1000</button>
          </div>
        </div>
      );
    case "exercise":
      return (
        <div className="text-center">
          <div className="text-5xl mb-2">💪</div>
          <div className="text-2xl font-bold">{value} min</div>
          <input type="range" min="0" max={target} value={value} onChange={(e) => onUpdate(parseInt(e.target.value))} className="w-full mt-2 accent-purple-500" />
        </div>
      );
    case "sleep":
      return (
        <div className="text-center">
          <div className="text-5xl mb-2">😴</div>
          <div className="text-2xl font-bold">{value} hrs</div>
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={() => onUpdate(Math.min(target, value + 1))} className="px-3 py-1 bg-indigo-500 text-white rounded-full text-xs">+1 hr</button>
          </div>
        </div>
      );
    default:
      return (
        <div className="text-center">
          <div className="text-5xl mb-2">{icon}</div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-gray-500">/ {target} {unit}</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all" style={{ width: `${(value / target) * 100}%` }} />
          </div>
        </div>
      );
  }
}