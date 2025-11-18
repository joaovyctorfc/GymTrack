import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import TemplatesView from './components/TemplatesView';
import AICoach from './components/AICoach';
import CalendarView from './components/CalendarView';
import ProgressView from './components/ProgressView';
import Navigation from './components/Navigation';
import Auth from './components/Auth';
import SetupScreen from './components/SetupScreen';
import { ViewState } from './types';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);

    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (configured) {
        // Initialize Session only if configured
        supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsLoading(false);
        });

        const {
        data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        });

        return () => subscription.unsubscribe();
    } else {
        setIsLoading(false);
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

  const handleSignOut = async () => {
      await supabase.auth.signOut();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} toggleTheme={toggleTheme} currentTheme={theme} onLogout={handleSignOut} />;
      case 'log':
        return <WorkoutLogger onSave={() => setCurrentView('dashboard')} />;
      case 'templates':
        return <TemplatesView />;
      case 'coach':
        return <AICoach />;
      case 'calendar':
        return <CalendarView />;
      case 'progress':
        return <ProgressView />;
      default:
        return <Dashboard onViewChange={setCurrentView} toggleTheme={toggleTheme} currentTheme={theme} onLogout={handleSignOut} />;
    }
  };

  if (isLoading) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-bold">Carregando IronTrack...</div>;
  }

  if (!isConfigured) {
      return <SetupScreen />;
  }

  if (!session) {
      return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      <div className="max-w-md mx-auto min-h-screen relative bg-slate-50 dark:bg-slate-950 shadow-2xl transition-colors duration-300">
        <main className="pb-20">
          {renderView()}
        </main>
        <Navigation currentView={currentView} setView={setCurrentView} />
      </div>
    </div>
  );
};

export default App;