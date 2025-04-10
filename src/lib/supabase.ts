
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bktqobrttcqgwvbodcjh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a conditional client to handle missing env variables
let supabase: ReturnType<typeof createClient<Database>>;

if (!supabaseKey) {
  console.error('Supabase anon key is missing.');
  console.error('Please ensure VITE_SUPABASE_ANON_KEY is set in your environment.');
  
  // Create a mock client that won't throw errors but won't work either
  supabase = createClient<Database>(
    supabaseUrl, // We now have a fallback URL
    'placeholder-key'
  );
  
  // Override methods to prevent actual API calls and return empty results
  const mockResponse = { data: null, error: { message: 'Supabase not configured' } };
  supabase.from = () => ({
    select: () => Promise.resolve(mockResponse),
    insert: () => Promise.resolve(mockResponse),
    update: () => Promise.resolve(mockResponse),
    delete: () => Promise.resolve(mockResponse),
    // Add any other methods you use
  }) as any;
} else {
  // Create the real client with actual credentials
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

export { supabase };
