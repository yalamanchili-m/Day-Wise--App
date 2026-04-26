import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickActionsMenu({ visible, x, y, onClose, onAction }) {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);
  
  const actions = [
    { id: "+1", label: "+1", icon: "➕", color: "text-green-600" },
    { id: "Reset", label: "Reset", icon: "🔄", color: "text-red-600" },
    { id: "Voice", label: "Voice Input", icon: "🎤", color: "text-purple-600" },
  ];
  
  // Adjust position if near edge of screen
  const adjustedX = x + 140 > window.innerWidth ? window.innerWidth - 150 : x;
  const adjustedY = y + 120 > window.innerHeight ? window.innerHeight - 130 : y;
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ position: "fixed", top: adjustedY, left: adjustedX, zIndex: 1000 }}
          className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden min-w-[140px]"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition ${action.color}`}
            >
              <span>{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}