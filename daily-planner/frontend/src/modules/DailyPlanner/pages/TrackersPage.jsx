import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Sparkline from "../components/Sparkline";
import AchievementBadges from "../components/AchievementBadges";
import QuickActionsMenu from "../components/QuickActionsMenu";
import BestDayBadge from "../components/BestDayBadge";
import StreakFireworks from "../components/StreakFireworks";
import DraggableTracker from "../components/DraggableTracker";
import useVoiceInput from "../hooks/useVoiceInput";

const ALL_TRACKERS = [
  { id: "water", name: "Water", unit: "glasses", target: 8, icon: "💧", color: "#3B82F6", gradient: "from-blue-400 to-blue-600", category: "Health", description: "Stay hydrated", type: "number", heatmapColor: "#3B82F6", heatmapLight: "#BFDBFE", heatmapDark: "#1E3A8A" },
  { id: "walk", name: "Walk", unit: "steps", target: 8000, icon: "🚶", color: "#10B981", gradient: "from-emerald-400 to-green-600", category: "Movement", description: "Daily steps", type: "number", heatmapColor: "#10B981", heatmapLight: "#A7F3D0", heatmapDark: "#064E3B" },
  { id: "exercise", name: "Exercise", unit: "minutes", target: 30, icon: "💪", color: "#EF4444", gradient: "from-red-400 to-red-600", category: "Movement", description: "Move your body", type: "number", heatmapColor: "#EF4444", heatmapLight: "#FEE2E2", heatmapDark: "#7F1D1D" },
  { id: "sleep", name: "Sleep", unit: "hours", target: 8, icon: "😴", color: "#8B5CF6", gradient: "from-purple-400 to-purple-600", category: "Health", description: "Rest well", type: "number", heatmapColor: "#8B5CF6", heatmapLight: "#EDE9FE", heatmapDark: "#4C1D95" },
  { id: "meditation", name: "Meditation", unit: "minutes", target: 10, icon: "🧘", color: "#EC4899", gradient: "from-pink-400 to-pink-600", category: "Mindfulness", description: "Clear your mind", type: "number", heatmapColor: "#EC4899", heatmapLight: "#FCE7F3", heatmapDark: "#9D174D" },
  { id: "reading", name: "Reading", unit: "pages", target: 20, icon: "📚", color: "#06B6D4", gradient: "from-cyan-400 to-cyan-600", category: "Learning", description: "Read daily", type: "number", heatmapColor: "#06B6D4", heatmapLight: "#CFFAFE", heatmapDark: "#164E63" },
  { id: "calories", name: "Calories", unit: "kcal", target: 2000, icon: "🔥", color: "#F59E0B", gradient: "from-amber-400 to-orange-500", category: "Nutrition", description: "Track intake", type: "number", heatmapColor: "#F59E0B", heatmapLight: "#FEF3C7", heatmapDark: "#92400E" },
  { id: "productivity", name: "Productivity", unit: "hours", target: 6, icon: "⚡", color: "#F97316", gradient: "from-orange-400 to-orange-600", category: "Work", description: "Get things done", type: "number", heatmapColor: "#F97316", heatmapLight: "#FFEDD5", heatmapDark: "#7C2D12" },
  { id: "social", name: "Social", unit: "hours", target: 2, icon: "👥", color: "#14B8A6", gradient: "from-teal-400 to-teal-600", category: "Connection", description: "Connect with others", type: "number", heatmapColor: "#14B8A6", heatmapLight: "#CCFBF1", heatmapDark: "#134E4A" },
  { id: "screen_time", name: "Screen Time", unit: "hours", target: 3, icon: "📱", color: "#6B7280", gradient: "from-gray-400 to-gray-600", category: "Health", description: "Reduce screen time", type: "number", heatmapColor: "#6B7280", heatmapLight: "#F3F4F6", heatmapDark: "#1F2937" },
  { id: "outdoor", name: "Outdoor", unit: "hours", target: 1, icon: "🌳", color: "#10B981", gradient: "from-emerald-400 to-green-600", category: "Health", description: "Get fresh air", type: "number", heatmapColor: "#10B981", heatmapLight: "#D1FAE5", heatmapDark: "#064E3B" },
  { id: "movies", name: "Movies", unit: "", target: "", icon: "🎬", color: "#EF4444", gradient: "from-red-400 to-red-600", category: "Entertainment", description: "Movies you watched", type: "text", placeholder: "Movie name" },
  { id: "books", name: "Books", unit: "", target: "", icon: "📖", color: "#8B5CF6", gradient: "from-purple-400 to-purple-600", category: "Learning", description: "Books you read", type: "text", placeholder: "Book title" },
  { id: "songs", name: "Songs", unit: "", target: "", icon: "🎵", color: "#EC4899", gradient: "from-pink-400 to-pink-600", category: "Entertainment", description: "Songs you love", type: "text", placeholder: "Song name" },
];

export default function TrackersPage({ 
  onBack, 
  theme, 
  trackerEntries = {}, 
  onTrackerUpdate, 
  selectedTrackers, 
  setSelectedTrackers, 
  setCurrentPage,
  themes,
  setTheme,
  currentTheme
}) {
  const [entries, setEntries] = useState(trackerEntries);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [textInputs, setTextInputs] = useState({});
  const [activeVoiceTracker, setActiveVoiceTracker] = useState(null);
  const [showFireworks, setShowFireworks] = useState(null);
  const [trackerOrder, setTrackerOrder] = useState(selectedTrackers);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, trackerId: null });
  const [showMonthView, setShowMonthView] = useState(false);
  const [selectedTrackerForMonth, setSelectedTrackerForMonth] = useState(null);
  const t = theme;

  const { isListening, transcript, startListening, stopListening } = useVoiceInput();

  useEffect(() => {
    setTrackerOrder(selectedTrackers);
  }, [selectedTrackers]);

  useEffect(() => {
    if (transcript && activeVoiceTracker) {
      const tracker = ALL_TRACKERS.find(t => t.id === activeVoiceTracker);
      if (tracker?.type === "number") {
        const numberValue = parseInt(transcript.match(/\d+/)?.[0]);
        if (numberValue) {
          updateValue(activeVoiceTracker, numberValue);
          toast.success(`Voice: ${numberValue} ${tracker.unit}`);
        } else {
          toast.error("Couldn't understand number. Try again.");
        }
      } else {
        updateValue(activeVoiceTracker, transcript);
        toast.success(`Voice: Added "${transcript}"`);
      }
      setActiveVoiceTracker(null);
      stopListening();
    }
  }, [transcript]);

  useEffect(() => {
    loadEntries();
  }, [selectedMonth]);

  useEffect(() => {
    selectedTrackers.forEach(trackerId => {
      const streak = getStreak(trackerId);
      if (streak === 7 || streak === 14 || streak === 21 || streak === 30) {
        setShowFireworks({ trackerId, streak });
        setTimeout(() => setShowFireworks(null), 3000);
      }
    });
  }, [entries]);

  const loadEntries = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/trackers?month=${selectedMonth}`);
      setEntries(res.data);
    } catch (error) { 
      console.error("Failed to load"); 
    }
  };

  const updateValue = async (trackerId, value) => {
    if (!value && value !== 0 && value !== "") {
      toast.error("Please enter a value");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/trackers", {
        tracker_type: trackerId,
        value: value,
        date: new Date().toISOString().split("T")[0],
      });
      await loadEntries();
      if (onTrackerUpdate) await onTrackerUpdate();
      setTextInputs({ ...textInputs, [trackerId]: "" });
      toast.success(`${trackerId} updated`);
    } catch (error) { 
      console.error("Update error:", error);
      toast.error("Failed to update"); 
    }
  };

  const addTracker = (trackerId) => {
    if (!selectedTrackers.includes(trackerId)) {
      const newList = [...selectedTrackers, trackerId];
      setSelectedTrackers(newList);
      localStorage.setItem("selectedTrackers", JSON.stringify(newList));
      toast.success(`${trackerId} added`);
    }
    setShowAddModal(false);
  };

  const removeTracker = (trackerId) => {
    const newList = selectedTrackers.filter(id => id !== trackerId);
    setSelectedTrackers(newList);
    localStorage.setItem("selectedTrackers", JSON.stringify(newList));
    toast.success(`Removed ${trackerId}`);
  };

  const reorderTrackers = (startIndex, endIndex) => {
    const newOrder = [...trackerOrder];
    const [removed] = newOrder.splice(startIndex, 1);
    newOrder.splice(endIndex, 0, removed);
    setTrackerOrder(newOrder);
    setSelectedTrackers(newOrder);
    localStorage.setItem("selectedTrackers", JSON.stringify(newOrder));
  };

  const getMonthlyTotal = (trackerId) => {
    const trackerEntriesData = entries[trackerId] || [];
    return trackerEntriesData.length;
  };

  const getEntriesList = (trackerId) => {
    const trackerEntriesData = entries[trackerId] || [];
    return [...trackerEntriesData].reverse();
  };

  const getStreak = (trackerId) => {
    const trackerEntriesData = entries[trackerId] || [];
    let streak = 0;
    for (let i = 0; i < trackerEntriesData.length; i++) {
      if (trackerEntriesData[i].value && trackerEntriesData[i].value !== "0") streak++;
      else break;
    }
    return streak;
  };

  const getBestDayValue = (trackerId) => {
    const trackerEntriesData = entries[trackerId] || [];
    if (trackerEntriesData.length === 0) return 0;
    const numericValues = trackerEntriesData.map(e => parseFloat(e.value)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return 0;
    return Math.max(...numericValues);
  };

  const getWeeklyData = (trackerId) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const entry = entries[trackerId]?.find(e => e.date === dateStr);
      const val = entry?.value;
      last7Days.push(val && !isNaN(parseFloat(val)) ? parseFloat(val) : 0);
    }
    return last7Days;
  };

  // Get month days with dates
  const getMonthDays = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month - 1, i));
    }
    return days;
  };

  const getValueForDate = (trackerId, date) => {
    const dateStr = date.toISOString().split("T")[0];
    const entry = entries[trackerId]?.find(e => e.date === dateStr);
    return entry?.value || null;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const categories = ["all", ...new Set(ALL_TRACKERS.map(t => t.category))];
  
  const filteredAvailableTrackers = ALL_TRACKERS.filter(t => 
    !selectedTrackers.includes(t.id) && 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === "all" || t.category === categoryFilter)
  );

  const totalCompleted = selectedTrackers.reduce((sum, id) => {
    const todayEntry = entries[id]?.find(e => e.date === todayStr);
    return sum + (todayEntry?.value ? 1 : 0);
  }, 0);
  
  const completionRate = selectedTrackers.length > 0 ? ((totalCompleted / selectedTrackers.length) * 100).toFixed(1) : 0;

  const getPerfectWeeks = () => 0;

  const handleContextMenu = (e, trackerId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, trackerId });
  };

  const handleQuickAction = (action, trackerId) => {
    const tracker = ALL_TRACKERS.find(t => t.id === trackerId);
    if (action === "+1") {
      const todayEntry = entries[trackerId]?.find(e => e.date === todayStr);
      const currentValue = todayEntry?.value || 0;
      updateValue(trackerId, parseFloat(currentValue) + 1);
    } else if (action === "Reset") {
      updateValue(trackerId, 0);
    } else if (action === "Voice") {
      setActiveVoiceTracker(trackerId);
      startListening();
    }
    setContextMenu({ visible: false, x: 0, y: 0, trackerId: null });
  };

  const HeatmapLegend = ({ tracker }) => {
    if (tracker.type === "text") return null;
    return (
      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-700">
        <div className="text-xs text-stone-500 mb-2">heatmap shades:</div>
        <div className="flex items-center gap-3 text-[10px] text-stone-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tracker.heatmapLight || "#e5e7eb" }}></div><span>0-25%</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${tracker.heatmapColor}99` }}></div><span>25-50%</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tracker.heatmapColor }}></div><span>50-75%</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tracker.heatmapDark || tracker.heatmapColor }}></div><span>75-100%</span></div>
        </div>
      </div>
    );
  };

  const EntriesList = ({ trackerId, entriesList }) => {
    const [showAll, setShowAll] = useState(false);
    const displayEntries = showAll ? entriesList : entriesList.slice(0, 3);
    if (entriesList.length === 0) return null;
    return (
      <div className="mt-3">
        <div className="text-xs text-stone-500 mb-1">Recent entries</div>
        <div className="space-y-1">
          {displayEntries.map((entry, idx) => (
            <div key={idx} className="text-xs bg-stone-50 dark:bg-stone-800 p-2 rounded-lg border border-stone-100 dark:border-stone-700">
              {entry.value}
              <span className="text-stone-400 text-xs ml-2">{entry.date}</span>
            </div>
          ))}
        </div>
        {entriesList.length > 3 && (<button onClick={() => setShowAll(!showAll)} className="text-xs text-stone-500 mt-1 hover:text-stone-700 transition">{showAll ? "Show less" : `Show ${entriesList.length - 3} more`}</button>)}
      </div>
    );
  };

  // ========== MONTH OVERVIEW WITH VISIBLE COLORS ==========
  const MonthOverview = ({ tracker, onClose }) => {
    const monthDays = getMonthDays();
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Get vibrant color based on value percentage
    const getColorForValue = (value, tracker) => {
      if (!value) return "bg-gray-100 dark:bg-gray-800";
      
      if (tracker.type === "text") {
        return "bg-purple-300 dark:bg-purple-700 border-purple-400";
      }
      
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return "bg-gray-100 dark:bg-gray-800";
      
      const percentage = Math.min(100, (numValue / tracker.target) * 100);
      
      // Different color schemes for different tracker types
      if (tracker.id === "water") {
        if (percentage < 25) return "bg-cyan-200 dark:bg-cyan-900/50";
        if (percentage < 50) return "bg-cyan-400 dark:bg-cyan-700";
        if (percentage < 75) return "bg-cyan-600 dark:bg-cyan-600 text-white";
        return "bg-cyan-800 dark:bg-cyan-900 text-white";
      }
      
      if (tracker.id === "walk" || tracker.id === "exercise") {
        if (percentage < 25) return "bg-green-200 dark:bg-green-900/50";
        if (percentage < 50) return "bg-green-400 dark:bg-green-700";
        if (percentage < 75) return "bg-green-600 dark:bg-green-600 text-white";
        return "bg-green-800 dark:bg-green-900 text-white";
      }
      
      if (tracker.id === "sleep") {
        if (percentage < 25) return "bg-indigo-200 dark:bg-indigo-900/50";
        if (percentage < 50) return "bg-indigo-400 dark:bg-indigo-700";
        if (percentage < 75) return "bg-indigo-600 dark:bg-indigo-600 text-white";
        return "bg-indigo-800 dark:bg-indigo-900 text-white";
      }
      
      // Default blue gradient
      if (percentage < 25) return "bg-blue-200 dark:bg-blue-900/50";
      if (percentage < 50) return "bg-blue-400 dark:bg-blue-700";
      if (percentage < 75) return "bg-blue-600 dark:bg-blue-600 text-white";
      return "bg-blue-800 dark:bg-blue-900 text-white";
    };
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${t.cardSolid} rounded-2xl max-w-3xl w-full p-6 shadow-2xl border ${t.border} max-h-[85vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-light">{tracker.name} - {selectedMonth}</h2>
            <button onClick={onClose} className="text-2xl text-stone-400 hover:text-stone-600">&times;</button>
          </div>
          
          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4 pb-2 border-b border-stone-100 dark:border-stone-700">
            <span className="text-xs text-stone-500">Darker = Higher value →</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-200"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-400"></div>
              <span className="text-xs">Med</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-600"></div>
              <span className="text-xs">High</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {weekDays.map(day => <div key={day} className="text-xs font-medium text-stone-500">{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="aspect-square rounded-lg bg-stone-50 dark:bg-stone-800/30"></div>;
              
              const value = getValueForDate(tracker.id, date);
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const bgColor = getColorForValue(value, tracker);
              
              // Determine text color based on background darkness
              let textColor = "text-stone-700 dark:text-stone-200";
              if (value && tracker.type !== "text") {
                const numValue = parseFloat(value);
                const percentage = (numValue / tracker.target) * 100;
                if (percentage > 50) textColor = "text-white";
              }
              if (tracker.type === "text" && value) textColor = "text-purple-800 dark:text-purple-200";
              
              return (
                <div key={dateStr} className={`aspect-square rounded-lg p-2 text-center border ${isToday ? 'border-amber-400 ring-2 ring-amber-200 shadow-md' : 'border-stone-200 dark:border-stone-700'} ${bgColor} transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center`}>
                  {/* DATE NUMBER */}
                  <div className={`text-sm font-bold ${textColor}`}>
                    {date.getDate()}
                  </div>
                  {/* VALUE - small text below the date */}
                  {value && (
                    <div className={`text-[10px] font-mono mt-0.5 ${textColor} opacity-90`}>
                      {value}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
            <p className="text-xs text-stone-400 text-center">📅 Click outside to close • Darker color = higher value</p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`${t.bg} ${t.text} min-h-screen w-full transition-all duration-500`} onContextMenu={(e) => e.preventDefault()}>
      <Toaster position="top-right" />
      
      {showFireworks && <StreakFireworks streak={showFireworks.streak} trackerName={showFireworks.trackerId} onComplete={() => setShowFireworks(null)} />}
      <QuickActionsMenu visible={contextMenu.visible} x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu({ visible: false, x: 0, y: 0, trackerId: null })} onAction={(action) => handleQuickAction(action, contextMenu.trackerId)} />
      <AchievementBadges perfectWeeks={getPerfectWeeks()} totalStreak={selectedTrackers.reduce((sum, id) => sum + getStreak(id), 0)} />
      {showMonthView && selectedTrackerForMonth && <MonthOverview tracker={selectedTrackerForMonth} onClose={() => { setShowMonthView(false); setSelectedTrackerForMonth(null); }} />}
      
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button onClick={onBack} className="px-4 py-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:shadow transition">← Back</button>
          <div className="text-center"><h1 className="text-2xl font-light tracking-wide text-stone-800 dark:text-stone-100">Daily Rituals</h1><p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">small steps, every day</p></div>
          <select value={currentTheme} onChange={(e) => setTheme(e.target.value)} className={`px-3 py-2 rounded-xl border ${t.border} ${t.cardSolid} ${t.text} text-sm font-medium cursor-pointer`}>
            {Object.entries(themes).map(([key, val]) => (<option key={key} value={key}>{val.name}</option>))}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">📈</div><div className="text-2xl font-light">{completionRate}%</div><div className="text-xs text-stone-500">completion rate</div></div>
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">✅</div><div className="text-2xl font-light">{selectedTrackers.length}</div><div className="text-xs text-stone-500">active habits</div></div>
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">🔥</div><div className="text-2xl font-light">{selectedTrackers.reduce((sum, id) => sum + getStreak(id), 0)}</div><div className="text-xs text-stone-500">total streak</div></div>
          <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm"><div className="text-2xl mb-1">🎯</div><div className="text-2xl font-light">{totalCompleted}</div><div className="text-xs text-stone-500">completed today</div></div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`px-4 py-2 rounded-xl border ${t.border} ${t.cardSolid} text-sm`} />
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:shadow transition">+ Add Habit</button>
        </div>

        {isListening && (<div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-center animate-pulse"><span className="text-purple-600 dark:text-purple-300">🎤 Listening... Speak now</span></div>)}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {trackerOrder.map((trackerId, idx) => {
              const tracker = ALL_TRACKERS.find(t => t.id === trackerId);
              if (!tracker) return null;
              const todayEntry = entries[trackerId]?.find(e => e.date === todayStr);
              const value = todayEntry?.value || (tracker.type === "text" ? "" : 0);
              const percentage = tracker.type !== "text" ? Math.min(100, (parseFloat(value) / tracker.target) * 100) : 0;
              const monthlyTotal = getMonthlyTotal(trackerId);
              const entriesList = getEntriesList(trackerId);
              const streak = getStreak(trackerId);
              const weeklyData = getWeeklyData(trackerId);
              const bestDayValue = getBestDayValue(trackerId);
              const isTextBased = tracker.type === "text";

              return (
                <DraggableTracker key={trackerId} id={trackerId} index={idx} onDragEnd={reorderTrackers}>
                  <div onContextMenu={(e) => handleContextMenu(e, trackerId)} className={`${t.cardSolid} rounded-2xl shadow-sm border ${t.border} overflow-hidden hover:shadow-md transition-all duration-300 cursor-move`}>
                    <div className={`h-1 bg-gradient-to-r ${tracker.gradient}`} />
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-2xl">{tracker.icon}</div>
                          <div><h3 className="font-medium text-stone-800 dark:text-stone-100">{tracker.name}</h3><p className="text-xs text-stone-500 dark:text-stone-400">{tracker.description}</p></div>
                        </div>
                        {streak > 0 && (<div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full"><span className="text-sm">🔥</span><span className="text-xs font-medium text-stone-600 dark:text-stone-300">{streak}</span></div>)}
                        <button onClick={() => { setSelectedTrackerForMonth(tracker); setShowMonthView(true); }} className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded" title="View month overview">📅</button>
                      </div>

                      {isTextBased ? (
                        <>
                          <div className="flex gap-2 mb-4">
                            <input type="text" value={textInputs[trackerId] || ""} onChange={(e) => setTextInputs({...textInputs, [trackerId]: e.target.value})} onKeyPress={(e) => e.key === "Enter" && updateValue(trackerId, textInputs[trackerId])} className={`flex-1 px-3 py-2 rounded-xl border ${t.border} bg-transparent text-sm`} placeholder={tracker.placeholder} />
                            <button onClick={() => { const val = textInputs[trackerId]; if (val && val.trim()) { updateValue(trackerId, val); } else { toast.error("Please enter something"); } }} className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm hover:bg-stone-200 transition">Add</button>
                            <button onClick={() => { setActiveVoiceTracker(trackerId); startListening(); }} className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 transition" title="Voice input">🎤</button>
                          </div>
                          <EntriesList trackerId={trackerId} entriesList={entriesList} />
                          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-between items-center text-sm">
                            <span className="text-stone-500">Total: {monthlyTotal} this month</span>
                            <button onClick={() => removeTracker(trackerId)} className="text-stone-400 hover:text-red-500 transition text-xs">Remove</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-center my-4">
                            <div className="relative w-28 h-28">
                              <svg className="w-28 h-28 transform -rotate-90">
                                <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="none" className="text-stone-200 dark:text-stone-700" />
                                <circle cx="56" cy="56" r="48" stroke={tracker.color} strokeWidth="6" fill="none" strokeDasharray={`${2 * Math.PI * 48}`} strokeDashoffset={`${2 * Math.PI * 48 * (1 - percentage / 100)}`} className="transition-all duration-700 ease-out" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-light">{value}</span><span className="text-xs text-stone-500">/ {tracker.target}</span></div>
                            </div>
                          </div>

                          <Sparkline data={weeklyData} color={tracker.color} />

                          <div className="flex gap-2 mb-4">
                            <input type="number" value={textInputs[trackerId] !== undefined ? textInputs[trackerId] : value} onChange={(e) => setTextInputs({...textInputs, [trackerId]: e.target.value})} className={`flex-1 px-3 py-2 rounded-xl border ${t.border} bg-transparent text-center`} placeholder={`Enter ${tracker.unit}`} />
                            <button onClick={() => updateValue(trackerId, textInputs[trackerId] !== undefined ? textInputs[trackerId] : value)} className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm hover:bg-stone-200 transition">Update</button>
                            <button onClick={() => { setActiveVoiceTracker(trackerId); startListening(); }} className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 transition" title="Voice input">🎤</button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 mt-2">
                            {[...Array(14)].map((_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - i);
                              const dateStr = date.toISOString().split("T")[0];
                              const entry = entries[trackerId]?.find(e => e.date === dateStr);
                              const entryValue = entry?.value || 0;
                              const numericValue = parseFloat(entryValue);
                              const isBestDay = numericValue === bestDayValue && bestDayValue > 0;
                              let heatmapColor = "#e5e7eb";
                              if (numericValue > 0) {
                                const valuePercentage = Math.min(100, (numericValue / tracker.target) * 100);
                                if (valuePercentage < 25) heatmapColor = tracker.heatmapLight;
                                else if (valuePercentage < 50) heatmapColor = `${tracker.heatmapColor}99`;
                                else if (valuePercentage < 75) heatmapColor = tracker.heatmapColor;
                                else heatmapColor = tracker.heatmapDark;
                              }
                              return (<div key={i} className="relative aspect-square rounded-md transition-all cursor-pointer group" style={{ backgroundColor: heatmapColor }} title={`${dateStr}: ${numericValue || 0} / ${tracker.target}`}>{isBestDay && <BestDayBadge />}</div>);
                            })}
                          </div>

                          <HeatmapLegend tracker={tracker} />

                          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-between items-center text-sm">
                            <span className="text-stone-500">Total: {monthlyTotal} this month</span>
                            <button onClick={() => removeTracker(trackerId)} className="text-stone-400 hover:text-red-500 transition text-xs">Remove</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </DraggableTracker>
              );
            })}
          </AnimatePresence>
        </div>

        {selectedTrackers.length === 0 && (<div className="text-center py-20"><div className="text-6xl mb-4">📔</div><h3 className="text-xl font-light mb-2">No habits yet</h3><p className="text-stone-500 mb-4">Start small — add a habit to track</p><button onClick={() => setShowAddModal(true)} className="px-6 py-3 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-medium hover:shadow transition">+ Add Your First Habit</button></div>)}

        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className={`${t.cardSolid} rounded-2xl max-w-md w-full p-6 shadow-xl border ${t.border}`} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-light mb-4">Add a Habit</h3>
                <input type="text" placeholder="Search habits..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${t.border} bg-transparent mb-3 text-sm`} />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`w-full px-3 py-2 rounded-xl border ${t.border} bg-transparent mb-3 text-sm`}>
                  {categories.map(cat => (<option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>))}
                </select>
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {filteredAvailableTrackers.map(tracker => (
                    <button key={tracker.id} onClick={() => addTracker(tracker.id)} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-300 hover:bg-stone-100 transition text-left">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-xl">{tracker.icon}</div><div><div className="font-medium text-sm">{tracker.name}</div><div className="text-xs text-stone-500">{tracker.category}</div></div></div>
                    </button>
                  ))}
                </div>
                {filteredAvailableTrackers.length === 0 && (<div className="text-center py-4 text-stone-500 text-sm">No habits found</div>)}
                <button onClick={() => setShowAddModal(false)} className="mt-4 w-full py-2 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 transition text-stone-700 text-sm">Cancel</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${t.cardSolid} border-t ${t.border} py-3 z-50`}>
        <div className="flex justify-center gap-6">
          <button onClick={() => setCurrentPage("planner")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full transition text-stone-500 hover:text-stone-700"><span className="text-xl">📅</span><span className="text-xs font-medium">Planner</span></button>
          <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-100"><span className="text-xl">📊</span><span className="text-xs font-medium">Trackers</span></button>
          <button onClick={() => setCurrentPage("journal")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📝</span><span className="text-xs font-medium">Journal</span></button>
          <button onClick={() => setCurrentPage("chatbot")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">✨</span><span className="text-xs font-medium">Reflect</span></button>
        </div>
      </div>
    </div>
  );
}