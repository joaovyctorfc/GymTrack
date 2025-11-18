import React, { useState, useEffect } from 'react';
import { ExerciseLog, WorkoutTemplate } from '../types';
import { saveTemplate, getTemplates, deleteTemplate, getAllExerciseNames } from '../services/storageService';
import { Plus, Trash2, Save, X, Dumbbell, ClipboardList, ChevronRight, Loader2 } from 'lucide-react';

const TemplatesView: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor State
  const [templateName, setTemplateName] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    refreshTemplates();
    loadExerciseNames();
  }, []);

  const refreshTemplates = async () => {
    const t = await getTemplates();
    setTemplates(t);
    setLoading(false);
  };

  const loadExerciseNames = async () => {
      const names = await getAllExerciseNames();
      setExistingNames(names);
  }

  const uid = () => Math.random().toString(36).substr(2, 9);

  // --- Actions ---

  const handleCreateNew = () => {
    setTemplateName('');
    setExercises([]);
    setEditingId(null);
    setMode('edit');
  };

  const handleEdit = (t: WorkoutTemplate) => {
    setTemplateName(t.name);
    setExercises(t.exercises);
    setEditingId(t.id);
    setMode('edit');
  };

  const handleDeleteCurrent = async () => {
    if (editingId && window.confirm('Tem certeza que deseja excluir esta ficha permanentemente?')) {
      setIsSaving(true);
      await deleteTemplate(editingId);
      await refreshTemplates();
      setMode('list');
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert("Dê um nome para a ficha.");
      return;
    }
    if (exercises.length === 0) {
      alert("Adicione pelo menos um exercício.");
      return;
    }

    setIsSaving(true);

    const newTemplate: WorkoutTemplate = {
      id: editingId || uid(),
      name: templateName,
      exercises: exercises
    };

    await saveTemplate(newTemplate);
    await refreshTemplates();
    setIsSaving(false);
    setMode('list');
  };

  // --- Exercise Logic ---

  const addExercise = () => {
    const newEx: ExerciseLog = {
      id: uid(),
      name: '',
      sets: [{ id: uid(), reps: 10, weight: 0, completed: false }]
    };
    setExercises([...exercises, newEx]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, name } : e));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(e => {
      if (e.id !== exId) return e;
      const prev = e.sets[e.sets.length - 1];
      return {
        ...e,
        sets: [...e.sets, { id: uid(), reps: prev ? prev.reps : 10, weight: prev ? prev.weight : 0, completed: false }]
      };
    }));
  };

  const updateSet = (exId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    setExercises(exercises.map(e => {
      if (e.id !== exId) return e;
      return { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) };
    }));
  };

  const removeSet = (exId: string, setId: string) => {
    setExercises(exercises.map(e => {
      if (e.id !== exId) return e;
      return { ...e, sets: e.sets.filter(s => s.id !== setId) };
    }));
  };

  // --- Render ---

  if (mode === 'list') {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Suas Fichas</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seus modelos de treino</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {loading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma ficha criada.</p>
            <button onClick={handleCreateNew} className="mt-4 text-emerald-500 font-bold text-sm hover:underline">
              Criar primeira ficha
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(t => (
              <div 
                key={t.id}
                onClick={() => handleEdit(t)}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{t.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Dumbbell size={12} /> {t.exercises.length} exercícios
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMode('list')} className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium flex items-center">
          Cancelar
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingId ? 'Editar Ficha' : 'Nova Ficha'}
        </h2>
        <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="text-emerald-500 font-bold text-sm flex items-center gap-1 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} Salvar
        </button>
      </div>

      <div className="space-y-6 pb-24">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome da Ficha</label>
          <input 
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Ex: Treino A - Superiores"
            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-bold px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
            {exercises.map((ex, idx) => (
                <div key={ex.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
                    <button onClick={() => removeExercise(ex.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="mr-8 mb-4">
                        <label className="text-xs text-slate-400 font-bold uppercase mb-1 block">Exercício {idx + 1}</label>
                        <input 
                            type="text" 
                            list={`list-${ex.id}`}
                            value={ex.name}
                            onChange={(e) => updateExerciseName(ex.id, e.target.value)}
                            placeholder="Nome do exercício..."
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-1 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                        />
                        <datalist id={`list-${ex.id}`}>
                             {existingNames.map(n => <option key={n} value={n} />)}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        {ex.sets.map((s, sIdx) => (
                            <div key={s.id} className="flex items-center gap-2 text-sm">
                                <span className="w-6 text-slate-400 font-mono text-xs">{sIdx + 1}</span>
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg px-2 border border-slate-100 dark:border-slate-800">
                                    <input 
                                        type="number" 
                                        value={s.weight}
                                        onChange={(e) => updateSet(ex.id, s.id, 'weight', parseFloat(e.target.value))}
                                        className="w-full bg-transparent py-2 text-center outline-none text-slate-900 dark:text-white"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-slate-400 px-1">kg</span>
                                </div>
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg px-2 border border-slate-100 dark:border-slate-800">
                                    <input 
                                        type="number" 
                                        value={s.reps}
                                        onChange={(e) => updateSet(ex.id, s.id, 'reps', parseFloat(e.target.value))}
                                        className="w-full bg-transparent py-2 text-center outline-none text-slate-900 dark:text-white"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-slate-400 px-1">reps</span>
                                </div>
                                <button onClick={() => removeSet(ex.id, s.id)} className="text-slate-300 hover:text-red-400 p-1">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addSet(ex.id)} className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline">
                        <Plus size={12} /> Adicionar Série
                    </button>
                </div>
            ))}
        </div>

        <button 
            onClick={addExercise}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-colors font-semibold flex items-center justify-center gap-2"
        >
            <Plus size={18} /> Adicionar Exercício
        </button>

        {editingId && (
            <button 
                type="button"
                onClick={handleDeleteCurrent}
                disabled={isSaving}
                className="w-full py-3 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/40 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors mt-8 cursor-pointer relative z-10 disabled:opacity-50"
            >
                <Trash2 size={18} /> Excluir Ficha
            </button>
        )}
      </div>
    </div>
  );
};

export default TemplatesView;