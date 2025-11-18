import React, { useState, useEffect } from 'react';
import { getWorkouts } from '../services/storageService';
import { WorkoutSession } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Dumbbell, Loader2 } from 'lucide-react';

const CalendarView: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        const w = await getWorkouts();
        setWorkouts(w);
        setLoading(false);
        setSelectedDate(new Date());
    };
    loadData();
  }, []);

  // Calendar Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Generate grid array
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getWorkoutsForDay = (day: number) => {
    return workouts.filter(w => {
      const d = new Date(w.date);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  const selectedWorkouts = selectedDate 
    ? workouts.filter(w => {
        const d = new Date(w.date);
        return d.getDate() === selectedDate.getDate() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      );
  }

  return (
    <div className="p-6 pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Calendário</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 transition-colors">
        <div className="text-center mb-4">
          <span className="text-lg font-bold text-slate-900 dark:text-white capitalize">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`blank-${b}`} className="aspect-square"></div>)}
          {days.map(day => {
            const dayWorkouts = getWorkoutsForDay(day);
            const hasWorkout = dayWorkouts.length > 0;
            const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
            
            let label = '';
            if (hasWorkout) {
                const name = dayWorkouts[0].name;
                 if (name.toLowerCase().includes('ficha')) {
                     const parts = name.split(' ');
                     if (parts.length > 1) label = parts[1].substring(0,1).toUpperCase();
                 }
                 if (!label) label = name.substring(0,1).toUpperCase();
            }

            return (
              <div 
                key={day} 
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium cursor-pointer transition-all relative border
                  ${isSelected 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 z-10 scale-110 shadow-md' 
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}
                  ${hasWorkout && !isSelected ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-400'}
                `}
              >
                <span>{day}</span>
                {hasWorkout && (
                  <span className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-emerald-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
          {selectedDate 
            ? `Treinos em ${selectedDate.toLocaleDateString('pt-BR')}`
            : 'Selecione um dia'
          }
        </h3>

        {selectedWorkouts.length > 0 ? (
          selectedWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm animate-in slide-in-from-bottom-2 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{workout.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                    <span className="flex items-center gap-1"><Clock size={12}/> {workout.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><Dumbbell size={12}/> {workout.exercises.length} exercícios</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {workout.exercises.map((ex, idx) => (
                  <div key={idx} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                        <span>{ex.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{ex.sets.length} séries</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ex.sets.map((s, sIdx) => (
                            <div key={sIdx} className="text-xs bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400 font-mono">
                                {s.weight}kg x {s.reps}
                            </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : selectedDate ? (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <CalendarIcon className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">Nenhum treino registrado neste dia.</p>
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default CalendarView;