import React from "react";

export default function Home({ setCurrentPage }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-10">
      <h1 className="text-4xl font-bold">Your Space</h1>

      <div className="grid grid-cols-2 gap-6">

        <div onClick={() => setCurrentPage("planner")} className="cursor-pointer bg-gray-800 p-10 rounded-xl hover:scale-105 transition">
          📅 Planner
        </div>

        <div onClick={() => setCurrentPage("trackers")} className="cursor-pointer bg-gray-800 p-10 rounded-xl hover:scale-105 transition">
          📊 Trackers
        </div>

        <div onClick={() => setCurrentPage("journal")} className="cursor-pointer bg-gray-800 p-10 rounded-xl hover:scale-105 transition">
          📝 Journal
        </div>

        <div onClick={() => setCurrentPage("chatbot")} className="cursor-pointer bg-gray-800 p-10 rounded-xl hover:scale-105 transition">
          ✨ AI Assistant
        </div>

      </div>
    </div>
  );
}