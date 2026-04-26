import React from "react";

export default function Sparkline({ data, color = "#3B82F6" }) {
  if (!data || data.length === 0) return null;
  
  const width = 120;
  const height = 30;
  const padding = 2;
  
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");
  
  const trend = data[data.length - 1] - data[0];
  const trendColor = trend > 0 ? "#10B981" : trend < 0 ? "#EF4444" : "#6B7280";
  const trendArrow = trend > 0 ? "↑" : trend < 0 ? "↓" : "→";
  
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((value, index) => (
          <circle
            key={index}
            cx={parseFloat(points.split(" ")[index]?.split(",")[0]) || 0}
            cy={parseFloat(points.split(" ")[index]?.split(",")[1]) || 0}
            r="2"
            fill={color}
          />
        ))}
      </svg>
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium" style={{ color: trendColor }}>
          {trendArrow} {Math.abs(trend).toFixed(0)}
        </span>
      </div>
    </div>
  );
}