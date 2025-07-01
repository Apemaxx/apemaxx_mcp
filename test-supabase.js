import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  try {
    // Using your project reference from the DATABASE_URL
    const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
    
    console.log('Discovering existing table structure for project:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test all possible table names that might exist
    const tablesToTest = ['users', 'profiles', 'shipments', 'bookings', 'consolidations', 
                         'warehouse_receipts', 'ai_insights', 'tracking_events', 'chat_messages'];
    
    console.log('\nScanning existing tables...');
    const existingTables = [];
    
    for (const tableName of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error || error.code !== 'PGRST106') {
          console.log('✅ Table "' + tableName + '" exists');
          existingTables.push(tableName);
          
          // Get first record to see the structure
          if (data && data.length > 0) {
            console.log('  Sample data structure:', Object.keys(data[0]));
          }
        }
      } catch (e) {
        // Table doesn't exist or permission issue
      }
    }
    
    console.log('\nExisting tables found:', existingTables);
    
    // Test specific table structures
    if (existingTables.includes('users')) {
      console.log('\n--- USERS TABLE STRUCTURE ---');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (userData && userData.length > 0) {
        console.log('Columns:', Object.keys(userData[0]));
        console.log('Sample:', userData[0]);
      } else {
        console.log('Users table is empty');
      }
    }
    
    if (existingTables.includes('profiles')) {
      console.log('\n--- PROFILES TABLE STRUCTURE ---');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profileData && profileData.length > 0) {
        console.log('Columns:', Object.keys(profileData[0]));
        console.log('Sample:', profileData[0]);
      } else {
        console.log('Profiles table is empty');
      }
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testSupabaseConnection();