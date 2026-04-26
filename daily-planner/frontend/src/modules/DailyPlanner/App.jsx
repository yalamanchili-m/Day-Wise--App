import React, { useState, useEffect } from "react";
import axios from "axios";
import Clock24h from "./components/Clock24h";
import TrackersPage from "./pages/TrackersPage";
import JournalPage from "./pages/JournalPage";
import Chatbot from "./components/Chatbot";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";

// Helper: get local date
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const timeToNumber = (timeStr) => {
  if (!timeStr) return 9;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours + minutes / 60;
  }
  return 9;
};

const numberToTime = (num) => {
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const parseTimeInput = (input) => {
  const val = input.toLowerCase().trim();
  if (!val) return null;
  const match = val.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1]);
    let minutes = match[2] ? parseInt(match[2]) : 0;
    let period = match[3] ? match[3].toLowerCase() : (hours >= 12 ? "pm" : "am");
    if (minutes < 0 || minutes > 59) return null;
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
    if (hours < 0 || hours > 23) return null;
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period.toUpperCase()}`;
  }
  return null;
};

// ========== THEMES - GUARANTEED TO HAVE ALL PROPERTIES ==========
const themes = {
  paper: {
    name: "Paper",
    bg: "bg-[#faf6ed]",
    card: "bg-white/95",
    cardSolid: "bg-white",
    text: "text-stone-800",
    textSecondary: "text-stone-500",
    border: "border-stone-200",
    accent: "from-amber-600 to-orange-600",
    shadow: "shadow-md",
    button: "bg-amber-600 hover:bg-amber-700",
  },
  linen: {
    name: "Linen",
    bg: "bg-[#f0ebe1]",
    card: "bg-[#fdf9f0]/95",
    cardSolid: "bg-[#fdf9f0]",
    text: "text-neutral-800",
    textSecondary: "text-neutral-500",
    border: "border-neutral-200",
    accent: "from-stone-500 to-stone-700",
    shadow: "shadow-sm",
    button: "bg-stone-600 hover:bg-stone-700",
  },
  sage: {
    name: "Sage",
    bg: "bg-[#ecf3e8]",
    card: "bg-white/95",
    cardSolid: "bg-white",
    text: "text-emerald-800",
    textSecondary: "text-emerald-600",
    border: "border-emerald-200",
    accent: "from-emerald-600 to-teal-600",
    shadow: "shadow-md",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  rosewater: {
    name: "Rosewater",
    bg: "bg-[#fef1f0]",
    card: "bg-white/95",
    cardSolid: "bg-white",
    text: "text-rose-800",
    textSecondary: "text-rose-500",
    border: "border-rose-200",
    accent: "from-rose-400 to-rose-600",
    shadow: "shadow-md",
    button: "bg-rose-500 hover:bg-rose-600",
  },
  midnight: {
    name: "Midnight",
    bg: "bg-[#1e1b18]",
    card: "bg-[#2c2824]/95",
    cardSolid: "bg-[#2c2824]",
    text: "text-amber-100",
    textSecondary: "text-amber-300",
    border: "border-amber-800/40",
    accent: "from-amber-500 to-orange-500",
    shadow: "shadow-xl",
    button: "bg-amber-600 hover:bg-amber-500",
  },
};

// Fallback theme in case of error
const FALLBACK_THEME = themes.paper;

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved && themes[saved] ? saved : "paper";
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem("currentPage");
    return saved || "home";
  });
  
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [trackerEntries, setTrackerEntries] = useState({});
  const [selectedTrackers, setSelectedTrackers] = useState(["water", "walk", "exercise", "sleep", "movies", "books", "songs"]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Get current theme object - GUARANTEED to exist
  const currentThemeObj = themes[theme] || FALLBACK_THEME;
  const todayStr = getLocalDate();
  const isPastDate = selectedDate < todayStr;
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("selectedTrackers");
    if (saved) setSelectedTrackers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedTrackers", JSON.stringify(selectedTrackers));
  }, [selectedTrackers]);

  useEffect(() => {
    fetchTasks();
    fetchNotes();
    fetchTrackers();
    fetchAISuggestions();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/tasks?target_date=${selectedDate}`);
      setTasks(res.data.tasks || []);
    } catch {
      setTasks([]);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notes");
      setNotes(res.data);
    } catch {
      setNotes([]);
    }
  };

  const fetchTrackers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/trackers");
      setTrackerEntries(res.data);
    } catch {
      setTrackerEntries({});
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/ai/suggest-tasks");
      setAiSuggestions(res.data.suggestions || []);
    } catch {
      setAiSuggestions([]);
    }
  };

  const handleStartTimeChange = (value) => {
    setStartInput(value);
    const parsed = parseTimeInput(value);
    if (parsed) {
      setStartTime(parsed);
      setStartInput("");
      toast.success(`Start time set to ${parsed}`);
    }
  };

  const handleEndTimeChange = (value) => {
    setEndInput(value);
    const parsed = parseTimeInput(value);
    if (parsed) {
      setEndTime(parsed);
      setEndInput("");
      toast.success(`End time set to ${parsed}`);
    }
  };

  const canEditTask = (taskStartTime) => {
    if (isPastDate) return false;
    if (selectedDate === todayStr && taskStartTime <= currentHour) return false;
    return true;
  };

  const addTask = async () => {
    if (isPastDate) {
      toast.error("Past days cannot be changed");
      return;
    }
    if (!name.trim()) {
      toast.error("Enter a task name");
      return;
    }
    const startNum = timeToNumber(startTime);
    const endNum = timeToNumber(endTime);
    if (startNum >= endNum) {
      toast.error("Start must be before end");
      return;
    }
    if (selectedDate === todayStr && startNum <= currentHour) {
      toast.error("Cannot add tasks for past times today");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/tasks", {
        name,
        start_time: startNum,
        end_time: endNum,
        date: selectedDate,
      });
      setName("");
      setIsAddingTask(false);
      fetchTasks();
      toast.success("Task added");
    } catch {
      toast.error("Failed to add");
    }
  };

  const updateTask = async () => {
    const startNum = timeToNumber(startTime);
    const endNum = timeToNumber(endTime);
    if (startNum >= endNum) {
      toast.error("Start must be before end");
      return;
    }
    if (selectedDate === todayStr && startNum <= currentHour) {
      toast.error("Cannot edit past tasks");
      return;
    }
    try {
      await axios.put(`http://localhost:8000/api/tasks/${editingTask.id}`, {
        name,
        start_time: startNum,
        end_time: endNum,
      });
      setEditingTask(null);
      setName("");
      setStartTime("9:00 AM");
      setEndTime("10:00 AM");
      fetchTasks();
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteTask = async (task) => {
    if (!canEditTask(task.start_time)) {
      toast.error("Cannot delete past tasks");
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${task.id}`);
      fetchTasks();
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const startEdit = (task) => {
    if (!canEditTask(task.start_time)) {
      toast.error("This task has already passed");
      return;
    }
    setEditingTask(task);
    setName(task.name);
    setStartTime(numberToTime(task.start_time));
    setEndTime(numberToTime(task.end_time));
    setIsAddingTask(true);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setName("");
    setStartTime("9:00 AM");
    setEndTime("10:00 AM");
    setIsAddingTask(false);
  };

  const addNote = async (content) => {
    try {
      await axios.post("http://localhost:8000/api/notes", { content });
      fetchNotes();
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const updateTracker = async (trackerId, value) => {
    try {
      await axios.post("http://localhost:8000/api/trackers", {
        tracker_type: trackerId,
        value: value,
        date: todayStr,
      });
      fetchTrackers();
      toast.success(`${trackerId} updated`);
    } catch {
      toast.error("Failed to update");
    }
  };

  const allTrackersInfo = {
    water: { name: "Water", unit: "glasses", target: 8, icon: "💧", color: "#3B82F6" },
    walk: { name: "Walk", unit: "steps", target: 8000, icon: "🚶", color: "#10B981" },
    exercise: { name: "Exercise", unit: "min", target: 30, icon: "💪", color: "#EF4444" },
    sleep: { name: "Sleep", unit: "hrs", target: 8, icon: "😴", color: "#8B5CF6" },
    movies: { name: "Movies", unit: "", target: "", icon: "🎬", color: "#EF4444", type: "text" },
    books: { name: "Books", unit: "", target: "", icon: "📖", color: "#8B5CF6", type: "text" },
    songs: { name: "Songs", unit: "", target: "", icon: "🎵", color: "#EC4899", type: "text" },
  };

  // ✅ HOME PAGE CHECK - MOVED INSIDE COMPONENT (FIXED)
  if (currentPage === "home") {
    return <Home setCurrentPage={setCurrentPage} />;
  }

  // PAGE SWITCHES
  if (currentPage === "trackers") {
    return (
      <TrackersPage
        onBack={() => setCurrentPage("planner")}
        theme={currentThemeObj}
        trackerEntries={trackerEntries}
        onTrackerUpdate={fetchTrackers}
        selectedTrackers={selectedTrackers}
        setSelectedTrackers={setSelectedTrackers}
        setCurrentPage={setCurrentPage}
        themes={themes}
        setTheme={setTheme}
        currentTheme={theme}
      />
    );
  }

  if (currentPage === "journal") {
    return <JournalPage onBack={() => setCurrentPage("planner")} theme={currentThemeObj} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === "chatbot") {
    return <Chatbot onBack={() => setCurrentPage("planner")} theme={currentThemeObj} setCurrentPage={setCurrentPage} />;
  }

  // MAIN PLANNER PAGE
  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${currentThemeObj.bg}`}>
      <Toaster position="top-right" />

      <div className="w-full px-5 md:px-8 py-6 pb-28">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${currentThemeObj.cardSolid} rounded-2xl ${currentThemeObj.shadow} p-5 mb-6 border ${currentThemeObj.border}`}
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-light tracking-wide text-stone-700">daily log</h1>
              <p className={`text-sm ${currentThemeObj.textSecondary} mt-1`}>simple pages, real moments</p>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-2 rounded-xl border-2 ${currentThemeObj.border} ${currentThemeObj.cardSolid} ${currentThemeObj.text} text-sm font-medium`}
              />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={`px-3 py-2 rounded-xl border-2 ${currentThemeObj.border} ${currentThemeObj.cardSolid} ${currentThemeObj.text} text-sm font-medium`}
              >
                {Object.entries(themes).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50/80 border-l-8 border-amber-400 rounded-r-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📌</span>
              <span className="font-medium text-amber-800">suggestions for today</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.slice(0, 3).map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setName(sugg.name);
                    setStartTime(numberToTime(sugg.start_time));
                    setEndTime(numberToTime(sugg.end_time));
                    setIsAddingTask(true);
                    setEditingTask(null);
                  }}
                  className="px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm shadow-sm hover:shadow-md"
                >
                  ✨ {sugg.name} · {numberToTime(sugg.start_time)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {isPastDate && (
          <div className="mb-6 p-3 bg-stone-100/80 border-l-4 border-stone-400 rounded-r-xl">
            <p className="text-stone-600 text-sm">🕯️ {selectedDate} — view only. Cannot edit past days.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-7 mb-8">
          <motion.div
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`${currentThemeObj.cardSolid} rounded-2xl ${currentThemeObj.shadow} p-5 border ${currentThemeObj.border}`}
          >
            <div className="flex items-center gap-2 mb-3 border-b border-dashed border-stone-200 pb-2">
              <span className="text-2xl">⏰</span>
              <h2 className="text-lg font-medium">day compass</h2>
            </div>
            <Clock24h tasks={tasks} />
            <p className={`text-center text-xs ${currentThemeObj.textSecondary} mt-4 italic`}>colored arcs = your plan</p>
          </motion.div>

          <motion.div
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`${currentThemeObj.cardSolid} rounded-2xl ${currentThemeObj.shadow} p-5 border ${currentThemeObj.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h2 className="text-lg font-medium">today's tasks</h2>
              </div>
              {!isPastDate && !editingTask && (
                <button
                  onClick={() => {
                    setIsAddingTask(!isAddingTask);
                    setEditingTask(null);
                    setName("");
                    setStartTime("9:00 AM");
                    setEndTime("10:00 AM");
                  }}
                  className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200"
                >
                  {isAddingTask ? "close" : "+ add task"}
                </button>
              )}
              {editingTask && (
                <button onClick={cancelEdit} className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-sm">
                  cancel edit
                </button>
              )}
            </div>

            <AnimatePresence>
              {(isAddingTask || editingTask) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-5 p-4 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="what matters today?"
                    className={`w-full px-4 py-2 rounded-xl border-2 ${currentThemeObj.border} bg-white mb-3 text-sm`}
                    autoFocus
                  />
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="text-xs text-stone-500 block mb-1">start time</label>
                      <input
                        type="text"
                        value={startInput}
                        onChange={(e) => setStartInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleStartTimeChange(startInput)}
                        placeholder="9am, 2:30pm, 14:30"
                        className={`w-full px-3 py-2 rounded-xl border-2 ${currentThemeObj.border} bg-white text-sm`}
                      />
                      <div className="text-xs text-stone-400 mt-1">current: {startTime}</div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-stone-500 block mb-1">end time</label>
                      <input
                        type="text"
                        value={endInput}
                        onChange={(e) => setEndInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleEndTimeChange(endInput)}
                        placeholder="10am, 3:30pm, 15:30"
                        className={`w-full px-3 py-2 rounded-xl border-2 ${currentThemeObj.border} bg-white text-sm`}
                      />
                      <div className="text-xs text-stone-400 mt-1">current: {endTime}</div>
                    </div>
                  </div>
                  <button
                    onClick={editingTask ? updateTask : addTask}
                    className={`w-full py-2 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition`}
                  >
                    {editingTask ? "update task" : "save to timeline"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📔</div>
                  <p className={`text-sm ${currentThemeObj.textSecondary}`}>
                    {isPastDate ? `no tasks on ${selectedDate}` : "empty page — add a task"}
                  </p>
                </div>
              ) : (
                tasks.map((task) => {
                  const isPassed = selectedDate === todayStr && task.start_time <= currentHour;
                  const canEdit = !isPastDate && !isPassed;
                  return (
                    <div
                      key={task.id}
                      className={`flex justify-between items-center p-3 rounded-xl bg-white/70 border ${currentThemeObj.border} ${!canEdit ? "opacity-60" : ""}`}
                    >
                      <div className="flex-1">
                        <span className="font-medium text-stone-800">{task.name}</span>
                        <div className={`text-xs ${currentThemeObj.textSecondary} mt-0.5`}>
                          {numberToTime(task.start_time)} → {numberToTime(task.end_time)}
                          {isPassed && <span className="ml-2 text-amber-500">(passed)</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {canEdit && (
                          <>
                            <button onClick={() => startEdit(task)} className="text-stone-400 hover:text-amber-600 p-1">
                              ✏️
                            </button>
                            <button onClick={() => deleteTask(task)} className="text-stone-400 hover:text-red-500 p-1">
                              🗑️
                            </button>
                          </>
                        )}
                        {!canEdit && !isPastDate && isPassed && <span className="text-xs text-stone-400">passed</span>}
                        {isPastDate && <span className="text-xs text-stone-400">archived</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {selectedTrackers.length > 0 && (
          <div
            className={`${currentThemeObj.cardSolid} rounded-2xl ${currentThemeObj.shadow} p-5 border ${currentThemeObj.border} mb-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <h2 className="text-lg font-medium">daily rituals</h2>
              </div>
              <button onClick={() => setCurrentPage("trackers")} className={`text-sm ${currentThemeObj.textSecondary} underline hover:text-amber-700`}>
                view all →
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedTrackers.slice(0, 4).map((trackerId) => {
                const tracker = allTrackersInfo[trackerId];
                if (!tracker) return null;
                const todayEntry = trackerEntries[trackerId]?.find((e) => e.date === todayStr);
                const value = todayEntry?.value || 0;
                const percentage = tracker.type !== "text" ? Math.min(100, (value / tracker.target) * 100) : 0;
                return (
                  <div key={trackerId} className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-2xl">{tracker.icon}</span>
                      <span className="text-sm font-bold bg-white px-2 py-0.5 rounded-full">
                        {tracker.type === "text" ? value || "—" : `${value}/${tracker.target}`}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-stone-700">{tracker.name}</p>
                    {tracker.type !== "text" && (
                      <div className="h-2 bg-stone-200 rounded-full mt-2 mb-3">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: tracker.color }} />
                      </div>
                    )}
                    <div className="flex gap-2">
                      {tracker.type === "text" ? (
                        <input
                          type="text"
                          placeholder={`Add ${tracker.name}`}
                          className="flex-1 px-2 py-1 text-sm rounded-lg border border-stone-200"
                          onKeyPress={(e) => e.key === "Enter" && updateTracker(trackerId, e.target.value)}
                        />
                      ) : (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => updateTracker(trackerId, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded-lg border border-stone-200"
                          placeholder="amount"
                        />
                      )}
                      <button
                        onClick={() =>
                          updateTracker(trackerId, tracker.type === "text" ? prompt(`Enter ${tracker.name} name:`) : tracker.target)
                        }
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm border border-amber-200"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${currentThemeObj.cardSolid} border-t-2 ${currentThemeObj.border} py-3 z-50`}>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setCurrentPage("planner")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full ${currentPage === "planner" ? "bg-amber-100 text-amber-800" : currentThemeObj.textSecondary}`}
          >
            <span className="text-xl">📅</span>
            <span className="text-xs">planner</span>
          </button>
          <button
            onClick={() => setCurrentPage("trackers")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full ${currentPage === "trackers" ? "bg-amber-100 text-amber-800" : currentThemeObj.textSecondary}`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">trackers</span>
          </button>
          <button
            onClick={() => setCurrentPage("journal")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full ${currentPage === "journal" ? "bg-amber-100 text-amber-800" : currentThemeObj.textSecondary}`}
          >
            <span className="text-xl">📝</span>
            <span className="text-xs">journal</span>
          </button>
          <button
            onClick={() => setCurrentPage("chatbot")}
            className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full ${currentPage === "chatbot" ? "bg-amber-100 text-amber-800" : currentThemeObj.textSecondary}`}
          >
            <span className="text-xl">✨</span>
            <span className="text-xs">reflect</span>
          </button>
        </div>
      </div>
    </div>
  );
}