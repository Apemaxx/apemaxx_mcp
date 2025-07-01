import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDA0NzEsImV4cCI6MjA2Njg3NjQ3MX0.J-oc--P_VWTiJJU-Baj9wBqFV6M1QPBsAkSUZJEvUgs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);