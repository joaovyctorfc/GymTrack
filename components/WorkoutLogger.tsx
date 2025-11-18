import React, { useState, useEffect } from 'react';
import { ExerciseLog, ExerciseSet, WorkoutSession, WorkoutTemplate } from '../types';
import { saveWorkout, getAllExerciseNames, getTemplates } from '../services/storageService';
import { Save, Clock, Play, CheckCircle2, Check, Loader2 } from 'lucide-react';

interface WorkoutLoggerProps {
  onSave: () => void;
}

type Mode = 'select' | 'active_workout';

const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ onSave }) => {
  const [mode, setMode] = useState<Mode>('select');
  
  // Active Workout State
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState(60);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Template State
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    const loadTemplates = async () => {
        const t = await getTemplates();
        setTemplates(t);
        setLoadingTemplates(false);
    }
    loadTemplates();
  }, []);

  // Helper to generate IDs
  const uid = () => Math.random().toString(36).substr(2, 9);

  // --- Actions ---

  const startWorkout = (template: WorkoutTemplate) => {
    setWorkoutName(template.name);
    // Deep copy exercises to ensure we don't mutate the template directly in memory
    const copiedExercises = template.exercises.map(ex => ({
    ...ex,
    id: uid(), // New IDs for the session
    sets: ex.sets.map(s => ({ ...s, id: uid(), completed: false })) // Reset completion
    }));
    setExercises(copiedExercises);
    setMode('active_workout');
  };

  // --- Exercise Manipulation (Shared) ---

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'completed', value: number | boolean) => {
    setExercises(exercises.map(e => {
      if (e.id !== exerciseId) return e;
      return {
        ...e,
        sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  // --- Saving ---

  const handleFinishWorkout = async () => {
    if (!workoutName) {
      alert("Identifique o treino (ex: Ficha A, Peito, etc)");
      return;
    }
    
    setIsSaving(true);

    const session: WorkoutSession = {
      id: uid(),
      date: new Date().toISOString(),
      name: workoutName,
      durationMinutes: duration,
      exercises: exercises
    };

    await saveWorkout(session);

    const messages = [
        "Ótimo treino! Você está ficando mais forte a cada dia.",
        "Missão cumprida! O descanso também faz parte do treino.",
        "Parabéns! A consistência é o segredo do sucesso.",
        "Treino finalizado! Orgulhe-se do seu esforço hoje.",
        "Mais um para a conta! Continue focado nos seus objetivos.",
        "Excelente trabalho! Seu corpo agradece o esforço.",
        "Foco total! Você está construindo a sua melhor versão.",
        "Nada como a sensação de dever cumprido!",
        "Cada repetição conta. Hoje você foi incrível!"
    ];
    setSuccessMessage(messages[Math.floor(Math.random() * messages.length)]);
    setIsSaving(false);
    setIsFinished(true);
  };

  // --- Render Logic ---

  if (isFinished) {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full animate-fade-in bg-slate-50 dark:bg-slate-950">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl max-w-md w-full transition-colors relative overflow-hidden text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Treino Concluído!
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 px-4 leading-relaxed">
                    {successMessage}
                </p>
                
                <button 
                    onClick={onSave}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
      )
  }

  // View: Select Template to Start
  if (mode === 'select') {
      return (
        <div className="p-6 animate-fade-in bg-slate-50 dark:bg-slate-950 h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar Treino</h2>
                <button onClick={onSave} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">Voltar</button>
            </div>
            
            <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Selecione uma ficha</p>
                
                {loadingTemplates ? (
                     <div className="flex justify-center py-12">
                         <Loader2 className="animate-spin text-emerald-500" size={32} />
                     </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Você ainda não criou fichas.</p>
                        <p className="text-xs text-slate-400 mt-2">Vá até a aba "Fichas" para criar seu primeiro treino.</p>
                    </div>
                ) : (
                    templates.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => startWorkout(t)}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer group transition-all flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{t.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{t.exercises.length} exercícios</p>
                            </div>
                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Play size={20} fill="currentColor" className="ml-0.5"/>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      );
  }

  // View: Active Workout
  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex justify-between items-center">
        <button onClick={() => setMode('select')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm flex items-center">
             Cancelar
        </button>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <Clock size={16} className="text-emerald-600 dark:text-emerald-400"/>
            <input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="bg-transparent w-12 text-center text-slate-900 dark:text-white font-mono text-sm focus:outline-none"
            />
            <span className="text-slate-400 text-xs">min</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{workoutName}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Treino em andamento</p>
        </div>

        {exercises.map((exercise, exIndex) => {
          const isExerciseFinished = exercise.sets.every(s => s.completed);

          return (
            <div 
                key={exercise.id} 
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm animate-in slide-in-from-bottom-4 duration-300 fade-in transition-all ${
                    isExerciseFinished 
                    ? 'border-emerald-500 dark:border-emerald-500/60 shadow-emerald-500/10 ring-1 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex-1">
                    {exercise.name}
                </h3>
                {isExerciseFinished && (
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                        <Check size={14} strokeWidth={3} />
                        <span>Concluído</span>
                    </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-2 text-xs text-slate-500 text-center mb-2 font-medium uppercase tracking-wider">
                  <div className="col-span-2">Série</div>
                  <div className="col-span-3">Carga (kg)</div>
                  <div className="col-span-3">Reps</div>
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className={`grid grid-cols-8 gap-2 items-center transition-opacity ${set.completed ? 'opacity-100' : 'opacity-100'}`}>
                    <div className="col-span-2 flex justify-center">
                      <div 
                          onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono border-2 cursor-pointer transition-all transform active:scale-90 ${
                              set.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                              : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                      >
                          {set.completed ? <Check size={16} strokeWidth={3} /> : setIndex + 1}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <input 
                          type="number" 
                          value={set.weight} 
                          onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                          className={`w-full text-center rounded-lg py-2.5 text-base font-mono font-semibold focus:ring-2 focus:ring-emerald-500 outline-none border transition-colors ${
                              set.completed 
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent'
                          }`}
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                          type="number" 
                          value={set.reps} 
                          onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                          className={`w-full text-center rounded-lg py-2.5 text-base font-mono font-semibold focus:ring-2 focus:ring-emerald-500 outline-none border transition-colors ${
                              set.completed 
                                ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent'
                          }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-20 left-0 w-full px-4 z-40">
        <button 
            onClick={handleFinishWorkout}
            disabled={isSaving}
            className={`w-full max-w-md mx-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-75`}
        >
           {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
           {isSaving ? 'Salvando...' : 'Finalizar Treino'}
        </button>
      </div>
    </div>
  );
};

export default WorkoutLogger;