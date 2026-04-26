import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function Chatbot({ onBack, theme, setCurrentPage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const t = theme;

  useEffect(() => {
    setMessages([
      { role: "assistant", content: "Hello. I'm here to listen. How are you feeling today?", timestamp: new Date() }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8000/api/ai/chat", { message: userMessage });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.reply, timestamp: new Date() }]);
    } catch (error) {
      const fallbackResponses = [
        "That sounds meaningful. Would you like to talk more about it?",
        "I hear you. Take a deep breath. You're doing okay.",
        "Small steps matter. What's one thing you can do right now?",
        "Thank you for sharing. I'm here whenever you need.",
        "You've got this. Even just being here is enough."
      ];
      setMessages(prev => [...prev, { role: "assistant", content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)], timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const getMotivation = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/ai/motivate");
      setMessages(prev => [...prev, { role: "assistant", content: `✨ ${res.data.quote} ✨`, timestamp: new Date() }]);
    } catch {
      const quotes = [
        "The secret of getting ahead is getting started.",
        "You don't have to be great to start, but you have to start to be great.",
        "Your only limit is your mind.",
        "Small daily improvements are the key to staggering long-term results.",
        "Believe you can and you're halfway there.",
        "The future depends on what you do today."
      ];
      setMessages(prev => [...prev, { role: "assistant", content: `✨ ${quotes[Math.floor(Math.random() * quotes.length)]} ✨`, timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { text: "I'm feeling down" },
    { text: "Suggest something to do" },
    { text: "I need motivation" },
    { text: "How to focus?" },
    { text: "I'm tired" },
    { text: "I achieved something" },
  ];

  return (
    <div className={`${t.bg} ${t.text} min-h-screen w-full p-4 pb-24 transition-all duration-500`}>
      <div className="w-full max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium border border-amber-200 hover:shadow transition">← back</button>
          <div className="text-center"><h1 className="text-xl font-light tracking-wide text-stone-700">reflect</h1><p className={`text-xs ${t.textSecondary}`}>a quiet space</p></div>
          <div className="w-20" />
        </div>

        <div className={`flex-1 ${t.cardSolid} rounded-2xl ${t.shadow} overflow-hidden flex flex-col border ${t.border}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="bg-stone-100 p-3 rounded-2xl"><div className="flex gap-1"><span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span><span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span><span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span></div></div></div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-stone-200">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickActions.map((action, idx) => (
                <button key={idx} onClick={() => setInput(action.text)} className="px-3 py-1.5 text-xs bg-stone-100 rounded-full hover:bg-amber-100 transition whitespace-nowrap">{action.text}</button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-stone-200 flex gap-2">
            <button onClick={getMotivation} className="px-3 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition" title="Get motivation">✨</button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && sendMessage()} placeholder="write something..." className={`flex-1 px-4 py-2 rounded-full border ${t.border} ${t.cardSolid} focus:outline-none focus:ring-1 focus:ring-amber-400`} />
            <button onClick={sendMessage} disabled={loading} className="px-4 py-2 rounded-full bg-amber-600 text-white font-medium hover:bg-amber-700 transition disabled:opacity-50">send</button>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-0 right-0 ${t.cardSolid} border-t ${t.border} py-3 z-50`}>
        <div className="flex justify-center gap-6">
          <button onClick={() => setCurrentPage("planner")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📅</span><span className="text-xs">planner</span></button>
          <button onClick={() => setCurrentPage("trackers")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📊</span><span className="text-xs">trackers</span></button>
          <button onClick={() => setCurrentPage("journal")} className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full text-stone-500 hover:text-stone-700"><span className="text-xl">📝</span><span className="text-xs">journal</span></button>
          <button className="flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full bg-amber-100 text-amber-800"><span className="text-xl">✨</span><span className="text-xs">reflect</span></button>
        </div>
      </div>
    </div>
  );
}