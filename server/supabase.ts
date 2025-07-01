import { createClient } from '@supabase/supabase-js';

// Extract Supabase URL and anon key from DATABASE_URL or use environment variables
function getSupabaseConfig() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl) {
    // Extract project ref from database URL: aws-0-us-east-1.pooler.supabase.com
    // Format: postgres://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
    const match = dbUrl.match(/postgres\.([^:]+):/);
    if (match) {
      const projectRef = match[1];
      const supabaseUrl = `https://${projectRef}.supabase.co`;
      
      // Use anonymous key from environment or a default public key
      const anonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
      
      return { supabaseUrl, anonKey };
    }
  }
  
  // Fallback to direct environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  
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