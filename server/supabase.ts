import { createClient } from '@supabase/supabase-js';

// Extract Supabase URL and anon key from DATABASE_URL or use environment variables
function getSupabaseConfig() {
  // Use your specific Supabase project credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bqmpupymchanohpfzglw.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return { supabaseUrl, anonKey };
}

// Create Supabase client
export function createSupabaseClient() {
  try {
    const { supabaseUrl, anonKey } = getSupabaseConfig();
    
    console.log('🔍 Initializing Supabase client...');
    console.log('📋 Supabase URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false, // Server-side, no session persistence needed
      },
    });
    
    console.log('✅ Supabase client initialized successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    throw error;
  }
}

export const supabase = createSupabaseClient();