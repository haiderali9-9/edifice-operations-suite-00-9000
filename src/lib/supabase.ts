
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to empty string to prevent runtime errors, but client won't work
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || ''
);
