import React from "react";

export default function BestDayBadge() {
  return (
    <div className="absolute -top-1 -right-1">
      <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
        <span className="text-[8px] text-white">👑</span>
      </div>
    </div>
  );
}