export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string; // ex: "Ficha A"
  exercises: ExerciseLog[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string
  name: string; // e.g., "Push Day" or "Ficha A"
  exercises: ExerciseLog[];
  durationMinutes: number;
}

export type ViewState = 'dashboard' | 'log' | 'templates' | 'calendar' | 'progress' | 'coach';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}