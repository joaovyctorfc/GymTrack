import React, { useState, useEffect } from 'react';
import { getWorkouts, deleteWorkout } from '../services/storageService';
import { WorkoutSession } from '../types';
import { Trash2, Calendar, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const HistoryList: React.FC = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const data = await getWorkouts();
      setWorkouts(data);
      setLoading(false);
    };
    fetchWorkouts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este treino?")) {
        await deleteWorkout(id);
        const data = await getWorkouts();
        setWorkouts(data);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Histórico de Treinos</h2>
      
      {workouts.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>Nenhum histórico encontrado. Comece a treinar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => toggleExpand(workout.id)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all hover:border-emerald-500/30 shadow-sm dark:shadow-md"
            >
              <div className="p-5 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{workout.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(workout.date).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {workout.durationMinutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={(e) => handleDelete(workout.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    {expandedId === workout.id ? <ChevronUp size={20} className="text-emerald-500"/> : <ChevronDown size={20} className="text-slate-400"/>}
                </div>
              </div>
              
              {expandedId === workout.id && (
                <div className="px-5 pb-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                  <div className="space-y-3 pt-4">
                    {workout.exercises.map((ex, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-950/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800/50 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{ex.name}</span>
                           <span className="text-slate-500 dark:text-slate-500 text-xs">{ex.sets.length} séries</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {ex.sets.map((s, sIdx) => (
                                <div key={sIdx} className="bg-slate-100 dark:bg-slate-900 rounded px-2 py-1 text-center border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-900 dark:text-white">{s.weight}</span> <span className="text-slate-400 dark:text-slate-600">x</span> <span className="text-slate-900 dark:text-white">{s.reps}</span>
                                </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;