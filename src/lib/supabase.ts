
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Check if environment variables are defined
const supabaseUrl = "https://clowkphpdyuamzscmztv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3drcGhwZHl1YW16c2NtenR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MzYxNzUsImV4cCI6MjA2MDExMjE3NX0.77tk7GP5CBQTaYxWSw82AzwJfTfG-G2mkorlXz5U1Ys";

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
