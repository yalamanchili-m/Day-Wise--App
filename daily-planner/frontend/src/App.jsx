import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedModule, setSelectedModule] = useState(null);

  // Module components (we'll load the actual apps)
  const modules = {
    daily: {
      name: 'Daily Planner',
      icon: '📅',
      color: '#f59e0b',
      url: 'http://localhost:3000',
      description: 'Manage your tasks, habits, and daily schedule'
    },
    finance: {
      name: 'Finance Tracker',
      icon: '💰',
      color: '#3b82f6',
      url: 'http://localhost:3001',
      description: 'Track expenses, income, and budgets'
    },
    meal: {
      name: 'Meal Planner',
      icon: '🍽️',
      color: '#10b981',
      url: null,
      description: 'Recipes, meal prep, and shopping lists'
    }
  };

  // Profile selection screen (Netflix style)
  if (!selectedModule) {
    return (
      <div className="profile-selector">
        <div className="hero">
          <h1>My Life Dashboard</h1>
          <p>Choose a module to get started</p>
        </div>
        <div className="profiles">
          {Object.entries(modules).map(([key, module]) => (
            <div
              key={key}
              className="profile-card"
              onClick={() => module.url && setSelectedModule(key)}
              style={{ opacity: module.url ? 1 : 0.5, cursor: module.url ? 'pointer' : 'not-allowed' }}
            >
              <div className="profile-avatar" style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}dd)` }}>
                {module.icon}
              </div>
              <h3>{module.name}</h3>
              <p>{module.description}</p>
              {module.url ? <button>Launch →</button> : <button disabled>Coming Soon</button>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module view screen (shows the actual app)
  const currentModule = modules[selectedModule];
  
  return (
    <div className="module-view">
      <div className="module-header" style={{ background: `linear-gradient(135deg, ${currentModule.color}, ${currentModule.color}dd)` }}>
        <button className="back-button" onClick={() => setSelectedModule(null)}>
          ← Back to Dashboard
        </button>
        <div className="module-title">
          <span>{currentModule.icon}</span>
          <h2>{currentModule.name}</h2>
        </div>
      </div>
      <div className="module-content">
        <iframe 
          src={currentModule.url} 
          title={currentModule.name}
          className="app-iframe"
        />
      </div>
    </div>
  );
}

export default App;