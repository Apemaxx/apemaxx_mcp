import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  try {
    // Using your project reference from the DATABASE_URL
    const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
    
    console.log('Testing connection to:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check tables
    console.log('\n1. Testing table access...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_list')
      .limit(10);
    
    if (tablesError) {
      console.log('RPC not available, trying direct table queries...');
      
      // Test 2: Try to query users table
      console.log('\n2. Testing users table...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        console.log('Users table error:', usersError);
        
        // Test 3: Try profiles table
        console.log('\n3. Testing profiles table...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (profilesError) {
          console.log('Profiles table error:', profilesError);
        } else {
          console.log('✅ Profiles table accessible:', profiles);
        }
      } else {
        console.log('✅ Users table accessible:', users);
      }
    } else {
      console.log('✅ Tables found:', tables);
    }
    
    // Test 4: Try auth tables
    console.log('\n4. Testing auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.getUser();
    console.log('Auth test result:', { authUsers, authError });
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testSupabaseConnection();