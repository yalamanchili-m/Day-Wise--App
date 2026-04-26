import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function HeatmapWidget({ trackerId, entries }) {
  const { theme } = useTheme();

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const getValueForDate = (dateStr) => {
    const trackerEntries = entries[trackerId] || [];
    const entry = trackerEntries.find(e => e.date === dateStr);
    return entry ? entry.value : 0;
  };

  const getColorIntensity = (value, maxValue = 10) => {
    const intensity = Math.min(1, value / maxValue);
    if (intensity === 0) return "bg-gray-100 dark:bg-gray-700";
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  const days = getLast30Days();

  return (
    <div>
      <div className="grid grid-cols-10 gap-1">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded ${getColorIntensity(getValueForDate(day))} transition-all hover:scale-110 cursor-pointer`}
            title={`${day}: ${getValueForDate(day)}`}
          />
        ))}
      </div>
      <div className={`flex justify-between text-xs ${theme.textSecondary} mt-2`}>
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}