import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import AICoach from './components/AICoach';
import HistoryList from './components/HistoryList';
import Navigation from './components/Navigation';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Initialize theme from local storage or default to dark
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} toggleTheme={toggleTheme} currentTheme={theme} />;
      case 'log':
        return <WorkoutLogger onSave={() => setCurrentView('dashboard')} />;
      case 'coach':
        return <AICoach />;
      case 'history':
        return <HistoryList />;
      default:
        return <Dashboard onViewChange={setCurrentView} toggleTheme={toggleTheme} currentTheme={theme} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 dark:bg-slate-950 shadow-2xl overflow-hidden transition-colors duration-300">
        {/* Main Content Area */}
        <main className="h-full min-h-screen">
          {renderView()}
        </main>

        {/* Navigation */}
        <Navigation currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;