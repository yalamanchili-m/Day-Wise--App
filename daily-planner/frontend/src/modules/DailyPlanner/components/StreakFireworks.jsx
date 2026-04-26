import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function StreakFireworks({ streak, trackerName, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 200 - 100,
    color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    delay: Math.random() * 0.5,
  }));
  
  const streakMessages = {
    7: "7 Day Streak! 🔥",
    14: "14 Day Streak! 🔥🔥",
    21: "21 Day Streak! 🔥🔥🔥",
    30: "30 Day Streak! Legendary! 👑",
  };
  
  const message = streakMessages[streak] || `${streak} Day Streak! 🔥`;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl z-10"
      >
        {message}
      </motion.div>
      
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: particle.x, y: particle.y, scale: 0, opacity: 0 }}
          transition={{ duration: 1.5, delay: particle.delay, ease: "easeOut" }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}