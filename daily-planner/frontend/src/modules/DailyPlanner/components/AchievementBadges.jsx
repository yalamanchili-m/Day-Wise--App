import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AchievementBadges({ perfectWeeks, totalStreak }) {
  const [showBadge, setShowBadge] = useState(null);
  
  useEffect(() => {
    if (perfectWeeks > 0 && perfectWeeks % 1 === 0) {
      setShowBadge({ type: "perfectWeek", count: perfectWeeks });
      setTimeout(() => setShowBadge(null), 3000);
    }
  }, [perfectWeeks]);
  
  useEffect(() => {
    if (totalStreak === 7 || totalStreak === 14 || totalStreak === 21 || totalStreak === 30 || totalStreak === 50 || totalStreak === 100) {
      setShowBadge({ type: "streak", days: totalStreak });
      setTimeout(() => setShowBadge(null), 3000);
    }
  }, [totalStreak]);
  
  return (
    <AnimatePresence>
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
        >
          {showBadge.type === "perfectWeek" && (
            <>
              <span className="text-2xl">🏆</span>
              <span className="font-medium">Perfect Week! {showBadge.count}x</span>
            </>
          )}
          {showBadge.type === "streak" && (
            <>
              <span className="text-2xl">🔥</span>
              <span className="font-medium">{showBadge.days} Day Streak!</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}