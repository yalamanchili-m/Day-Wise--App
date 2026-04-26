import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TaskList({ tasks, onTaskUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState('');

  const deleteTask = async (id, name) => {
    await axios.delete(`http://localhost:8000/api/tasks/${id}`);
    toast.success(`Removed "${name}"`);
    onTaskUpdate();
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditTime(task.start_time);
    setEditDuration(task.duration);
  };

  const saveEdit = async (id) => {
    await axios.put(`http://localhost:8000/api/tasks/${id}`, { 
      name: editName,
      start_time: parseFloat(editTime),
      duration: parseFloat(editDuration)
    });
    setEditingId(null);
    toast.success('Task updated!');
    onTaskUpdate();
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-blue-100 text-blue-700',
      personal: 'bg-green-100 text-green-700',
      health: 'bg-red-100 text-red-700',
      break: 'bg-yellow-100 text-yellow-700',
      habit: 'bg-purple-100 text-purple-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">✨</div>
          <p className="text-gray-500">No tasks for today. Add some or try AI suggestions!</p>
        </div>
      )}
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl group hover:shadow-md transition-all">
          {editingId === task.id ? (
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2 py-1 rounded border dark:bg-gray-600"
                placeholder="Task name"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-20 px-2 py-1 rounded border dark:bg-gray-600"
                  placeholder="Hour"
                  step="0.5"
                />
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-20 px-2 py-1 rounded border dark:bg-gray-600"
                  placeholder="Hours"
                  step="0.5"
                />
                <button onClick={() => saveEdit(task.id)} className="px-3 py-1 bg-green-500 text-white rounded">💾</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-500 text-white rounded">❌</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{task.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ⏰ {task.start_time}:00 - {task.start_time + task.duration}:00 ({task.duration}h)
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(task)} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                <button onClick={() => deleteTask(task.id, task.name)} className="text-red-500 hover:text-red-700 p-1">🗑️</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}