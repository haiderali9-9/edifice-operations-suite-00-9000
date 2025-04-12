
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bktqobrttcqgwvbodcjh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdHFvYnJ0dGNxZ3d2Ym9kY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDk5NzYsImV4cCI6MjA1OTg4NTk3Nn0.mv8bVB3tRQx4wyaxmfIXXdx4ihs2vEk1Aik2xUHuSjg';

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
