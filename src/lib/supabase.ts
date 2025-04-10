
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a conditional client to handle missing env variables
let supabase: ReturnType<typeof createClient<Database>>;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
  
  // Create a mock client that won't throw errors but won't work either
  // Using a valid URL format but with a domain that won't resolve
  supabase = createClient<Database>(
    'https://example-placeholder-supabase-url.com',
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
