import React, { useEffect, useState } from 'react';
import { getWorkouts } from '../services/storageService';
import { WorkoutSession } from '../types';
import { Dumbbell, Calendar as CalendarIcon, TrendingUp, ArrowRight, Sun, Moon, Play, Trophy, LogOut } from 'lucide-react';

interface DashboardProps {
    onViewChange: (v: any) => void;
    toggleTheme: () => void;
    currentTheme: 'light' | 'dark';
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, toggleTheme, currentTheme, onLogout }) => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        const data = await getWorkouts();
        setWorkouts(data);
        setLoading(false);
    };
    loadData();
  }, []);

  const lastWorkout = workouts.length > 0 ? workouts[0] : null;
  const totalWorkouts = workouts.length;
  const totalSets = workouts.reduce((acc, w) => acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.length, 0), 0);

  return (
    <div className="p-6 pb-24 space-y-8 animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">IronTrack <span className="text-emerald-500 dark:text-emerald-400">AI</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Bem-vindo de volta, Atleta.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={toggleTheme}
                className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
            >
                {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
             <button 
                onClick={onLogout}
                className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-500 shadow-sm transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* Hero Action Button */}
      <button 
        onClick={() => onViewChange('log')}
        className="w-full relative overflow-hidden bg-slate-900 dark:bg-emerald-950 rounded-3xl p-6 shadow-xl shadow-emerald-900/20 group transition-all duration-300 active:scale-[0.98]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="text-white ml-1" fill="currentColor" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">Começar Treino</h2>
                <p className="text-slate-300 text-sm font-medium">Selecione sua ficha e supere seus limites</p>
            </div>
        </div>
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-2">
             <CalendarIcon size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : totalWorkouts}</p>
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Treinos</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 mb-2">
             <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '-' : totalSets}</p>
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Séries Totais</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            Última Atividade
          </h3>
          <button onClick={() => onViewChange('calendar')} className="text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center hover:underline">
            Ver Histórico <ArrowRight size={14} className="ml-1" />
          </button>
        </div>
        
        {loading ? (
           <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"></div> 
        ) : lastWorkout ? (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors hover:border-emerald-500/30 cursor-pointer" onClick={() => onViewChange('calendar')}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-lg">{lastWorkout.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{new Date(lastWorkout.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-mono border border-slate-200 dark:border-slate-700">
                {lastWorkout.durationMinutes} min
              </span>
            </div>
            <div className="space-y-2 mt-4">
              {lastWorkout.exercises.slice(0, 2).map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{ex.name}</span>
                  <span className="text-slate-500 text-xs">{ex.sets.length} séries</span>
                </div>
              ))}
              {lastWorkout.exercises.length > 2 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center pt-1 font-medium">+{lastWorkout.exercises.length - 2} exercícios</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum treino recente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;