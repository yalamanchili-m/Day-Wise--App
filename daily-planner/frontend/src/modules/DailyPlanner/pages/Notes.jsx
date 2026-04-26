import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [feeling, setFeeling] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Failed to load notes');
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please write something');
      return;
    }
    try {
      const content = feeling ? `[Feeling: ${feeling}] ${newNote}` : newNote;
      await axios.post('http://localhost:8000/api/notes', { content });
      setNewNote('');
      setFeeling('');
      loadNotes();
      toast.success('Note saved!');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const feelings = ['😊 Happy', '😌 Calm', '🤔 Thoughtful', '😢 Sad', '⚡ Energetic', '😴 Tired', '🎉 Excited', '🧘 Peaceful'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
          📝 Journal & Thoughts
        </h1>

        {/* Feelings selector */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {feelings.map(f => (
            <button
              key={f}
              onClick={() => setFeeling(f)}
              className={`px-3 py-1 rounded-full text-sm transition ${feeling === f ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="How are you feeling today? What's on your mind? Write anything... ✨"
            className="w-full p-4 rounded-xl border dark:bg-gray-700 dark:border-gray-600 min-h-[150px] resize-none"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={addNote}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg transition"
            >
              Save Entry 💾
            </button>
          </div>
        </div>

        {/* Notes list */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Previous Entries</h2>
          {notes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-3">📔</div>
              <p>No entries yet. Start writing your thoughts!</p>
            </div>
          )}
          {notes.map((note, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}