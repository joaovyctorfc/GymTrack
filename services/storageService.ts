import { WorkoutSession, WorkoutTemplate } from '../types';
import { supabase } from './supabase';

// Helper para converter erros do Supabase em logs e retornar arrays vazios para evitar crash
const handleError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]:`, error);
};

export const getWorkouts = async (): Promise<WorkoutSession[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false }); // Newest first

  if (error) {
    handleError(error, 'getWorkouts');
    return [];
  }
  
  // Mapear para garantir que o JSON venha correto (embora o TS infira)
  return data as WorkoutSession[];
};

export const saveWorkout = async (workout: WorkoutSession): Promise<void> => {
  // Remove ID if it was generated locally via Math.random (let Supabase handle UUID if needed, 
  // but if we want to keep frontend IDs, we can).
  // Given the schema uses uuid default gen_random_uuid(), we can omit ID for new inserts 
  // OR use a proper UUID generator. Since existing code uses random string IDs, 
  // let's let Supabase generate the ID for consistency, or pass it if it's a valid UUID.
  // For simplicity with existing frontend logic: We will just send the object.
  // IMPORTANT: The frontend ID generator (Math.random) creates short strings, not UUIDs.
  // Supabase expects UUIDs for the ID column.
  
  const { id, ...workoutData } = workout;
  
  // Insert without ID to let Supabase generate a valid UUID
  const { error } = await supabase
    .from('workouts')
    .insert([workoutData]);

  if (error) handleError(error, 'saveWorkout');
};

export const deleteWorkout = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);

  if (error) handleError(error, 'deleteWorkout');
};

// --- Template (Fichas) Functions ---

export const getTemplates = async (): Promise<WorkoutTemplate[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleError(error, 'getTemplates');
    return [];
  }
  return data as WorkoutTemplate[];
};

export const saveTemplate = async (template: WorkoutTemplate): Promise<void> => {
  // Check if it's an update or insert.
  // Since our frontend IDs are not UUIDs, we can't rely on them for existing Supabase rows directly 
  // unless we stored the Supabase UUID back into the state.
  // Simplified approach: If the template has a valid UUID, update. If it has a short string ID, insert.
  
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  if (isUUID(template.id)) {
      const { error } = await supabase
        .from('templates')
        .update({ 
            name: template.name, 
            exercises: template.exercises 
        })
        .eq('id', template.id);
        
      if (error) handleError(error, 'updateTemplate');
  } else {
      // Insert new
      const { id, ...templateData } = template;
      const { error } = await supabase.from('templates').insert([templateData]);
      if (error) handleError(error, 'createTemplate');
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (error) handleError(error, 'deleteTemplate');
};

// --- Statistics ---

export const getExerciseHistory = async (exerciseName: string) => {
  // Fetch all workouts to calculate history locally. 
  // Doing this aggregation in SQL with JSONB columns is complex and brittle.
  const workouts = await getWorkouts();
  
  const history: { date: string; weight: number; reps: number; volume: number }[] = [];

  // Reverse to process chronologically if needed, but chart handles dates.
  [...workouts].reverse().forEach(workout => {
    workout.exercises.forEach(ex => {
      if (ex.name.toLowerCase() === exerciseName.toLowerCase()) {
        const maxWeight = Math.max(...ex.sets.map(s => s.weight));
        const totalVolume = ex.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        
        history.push({
          date: new Date(workout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: maxWeight,
          reps: ex.sets.reduce((acc, s) => acc + s.reps, 0),
          volume: totalVolume
        });
      }
    });
  });
  return history;
};

export const getAllExerciseNames = async (): Promise<string[]> => {
  // Fetch both sources
  const [workouts, templates] = await Promise.all([
      getWorkouts(),
      getTemplates()
  ]);

  const names = new Set<string>();
  workouts.forEach(w => w.exercises.forEach(e => names.add(e.name)));
  templates.forEach(t => t.exercises.forEach(e => names.add(e.name)));
  return Array.from(names).sort();
};