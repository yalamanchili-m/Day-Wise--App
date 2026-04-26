import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "axios";

// Helper function to format local time correctly
const formatLocalTime = (dateStr) => {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export default function JournalPage({ onBack, theme, setCurrentPage }) {
  const t = theme;
  const [newNote, setNewNote] = useState("");
  const [feeling, setFeeling] = useState("");
  const [allNotes, setAllNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewMode, setViewMode] = useState("recent");

  const feelings = ["Happy", "Calm", "Thoughtful", "Sad", "Energetic", "Tired", "Excited", "Peaceful"];

  useEffect(() => {
    fetchAllNotes();
  }, []);

  const fetchAllNotes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notes");
      setAllNotes(res.data);
    } catch (error) {
      console.error("Failed to fetch notes");
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please write something");
      return;
    }
    const content = feeling ? `[${feeling}] ${newNote}` : newNote;
    try {
      await axios.post("http://localhost:8000/api/notes", { content });
      setNewNote("");
      setFeeling("");
      fetchAllNotes();
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const getLast7DaysNotes = () => {
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split("T")[0]);
    }
    const notesByDate = {};
    last7Days.forEach(date => {
      notesByDate[date] = allNotes.filter(note => note.created_at === date);
    });
    return notesByDate;
  };

  const getNotesByDate = (date) => {
    return allNotes.filter(note => note.created_at === date);
  };

  const last7DaysNotes = getLast7DaysNotes();
  const selectedDateNotes = getNotesByDate(selectedDate);

  return (
    <div className={`${t.bg} ${t.text} min-h-screen w-full p-4 pb-24 transition-all duration-500`}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <button onClick={onBack} className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200 hover:shadow transition">← back</button>
          <div className="text-center">
            <h1 className="text-2xl font-light tracking-wide text-stone-700">journal</h1>
            <p className={`text-xs ${t.textSecondary}`}>written memories</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setViewMode("recent")} className={`px-4 py-2 rounded-full text-sm transition ${viewMode === "recent" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-stone-100 text-stone-500"}`}>last 7 days</button>
          <button onClick={() => setViewMode("byDate")} className={`px-4 py-2 rounded-full text-sm transition ${viewMode === "byDate" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-stone-100 text-stone-500"}`}>search by date</button>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`${t.cardSolid} rounded-2xl ${t.shadow} p-6 mb-6 border ${t.border}`}>
          <h2 className="text-lg font-medium mb-4">how are you feeling?</h2>
          <div className="flex gap-2 flex-wrap mb-4">
            {feelings.map(f => (
              <button key={f} onClick={() => setFeeling(f)} className={`px-3 py-1.5 rounded-full text-sm transition ${feeling === f ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{f}</button>
            ))}
          </div>
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="write your thoughts, feelings, or anything on your mind..." className={`w-full p-4 rounded-xl border ${t.border} ${t.cardSolid} min-h-[120px] text-sm focus:outline-none focus:ring-1 focus:ring-amber-400`} />
          <button onClick={addNote} className={`mt-4 px-6 py-2 rounded-full bg-amber-600 text-white font-medium hover:bg-amber-700 transition`}>save entry</button>
        </motion.div>

        {viewMode === "recent" && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`${t.cardSolid} rounded-2xl ${t.shadow} p-6 border ${t.border}`}>
            <h2 className="text-lg font-medium mb-4">last 7 days</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {Object.entries(last7DaysNotes).map(([date, notes]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2"><div className="w-1 h-6 bg-amber-400 rounded-full"></div><h3 className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3></div>
                  {notes.length === 0 ? <p className="text-sm text-stone-400 italic ml-3">no entries</p> : (
                    <div className="space-y-2 ml-3">
                      {notes.map((noteItem) => (
                        <motion.div key={noteItem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                          <p className="text-sm">{noteItem.content}</p>
                          <p className={`text-xs ${t.textSecondary} mt-1`}>{formatLocalTime(noteItem.created_at)}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {viewMode === "byDate" && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`${t.cardSolid} rounded-2xl ${t.shadow} p-6 border ${t.border}`}>
            <h2 className="text-lg font-medium mb-4">search by date</h2>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`w-full px-4 py-2 rounded-xl border ${t.border} ${t.cardSolid} mb-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400`} />
            <div className="flex items-center gap-2 mb-3"><div className="w-1 h-6 bg-amber-400 rounded-full"></div><h3 className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3></div>
            {selectedDateNotes.length === 0 ? (
              <div className="text-center py-8"><div className="text-4xl mb-2">📔</div><p className={`${t.textSecondary}`}>no entries found.</p></div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDateNotes.map((noteItem) => (
                  <motion.div key={noteItem.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-sm">{noteItem.content}</p>
                    <p className={`text-xs ${t.textSecondary} mt-1`}>{formatLocalTime(noteItem.created_at)}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${t.cardSolid} border-t ${t.border} py-3 z-50`}>
        <div className="flex justify-center gap-6">
          <button onClick={() => setCurrentPage("planner")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📅</span><span className="text-xs">planner</span></button>
          <button onClick={() => setCurrentPage("trackers")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📊</span><span className="text-xs">trackers</span></button>
          <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full bg-amber-100 text-amber-800"><span className="text-xl">📝</span><span className="text-xs">journal</span></button>
          <button onClick={() => setCurrentPage("chatbot")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">✨</span><span className="text-xs">reflect</span></button>
        </div>
      </div>
    </div>
  );
}