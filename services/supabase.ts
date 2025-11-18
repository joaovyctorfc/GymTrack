import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore error if process is not defined
  }
  return undefined;
};

// User provided credentials
const DEFAULT_URL = 'https://ajypevpfxedywribtysv.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeXBldnBmeGVkeXdyaWJ0eXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTg5MDUsImV4cCI6MjA3OTA3NDkwNX0.6UWS8fwkMg2D_lFNRCtfc_Vfk1Xx4_1T8AQqgtB3GKI';

const envUrl = getEnv('SUPABASE_URL');
const envKey = getEnv('SUPABASE_ANON_KEY');

const localUrl = localStorage.getItem('sb_url');
const localKey = localStorage.getItem('sb_key');

// Prioritize Env > LocalStorage > Hardcoded Default
const supabaseUrl = envUrl || localUrl || DEFAULT_URL;
const supabaseKey = envKey || localKey || DEFAULT_KEY;

export const isSupabaseConfigured = () => {
  // Check if we have valid looking strings and not the old placeholder
  return (
    typeof supabaseUrl === 'string' && 
    supabaseUrl.length > 0 &&
    typeof supabaseKey === 'string' && 
    supabaseKey.length > 0 &&
    supabaseUrl !== 'https://placeholder.supabase.co'
  );
};

export const supabase = createClient(supabaseUrl, supabaseKey);