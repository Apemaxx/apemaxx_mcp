import { createClient } from '@supabase/supabase-js';

async function discoverSchema() {
  const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('=== DISCOVERING TABLE SCHEMAS ===');
  
  // Test different possible insert schemas for users table
  const testUserData = [
    { email: 'schema_test@test.com', password_hash: 'test' },
    { email: 'schema_test@test.com', passwordHash: 'test' },
    { email: 'schema_test@test.com', password: 'test' },
    { email: 'schema_test@test.com', pwd: 'test' },
    { email: 'schema_test@test.com', hash: 'test' },
  ];
  
  console.log('\nTesting Users Table Schema...');
  
  for (let i = 0; i < testUserData.length; i++) {
    const testData = testUserData[i];
    console.log('Testing schema ' + (i + 1) + ':', Object.keys(testData));
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(testData)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ SUCCESSFUL SCHEMA FOR USERS:', Object.keys(testData));
        console.log('Returned data structure:', Object.keys(data));
        console.log('Sample data:', data);
        
        // Clean up test record
        await supabase.from('users').delete().eq('email', 'schema_test@test.com');
        break;
      } else {
        console.log('❌ Failed:', error.message);
      }
    } catch (e) {
      console.log('❌ Exception:', e.message);
    }
  }
  
  // Test profiles table schema
  console.log('\nTesting Profiles Table Schema...');
  
  const testProfileData = [
    { user_id: 'test-id', first_name: 'Test', last_name: 'User' },
    { userId: 'test-id', firstName: 'Test', lastName: 'User' },
    { user_id: 'test-id', fname: 'Test', lname: 'User' },
    { uid: 'test-id', first_name: 'Test', last_name: 'User' },
  ];
  
  for (let i = 0; i < testProfileData.length; i++) {
    const testData = testProfileData[i];
    console.log('Testing profiles schema ' + (i + 1) + ':', Object.keys(testData));
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(testData)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ SUCCESSFUL SCHEMA FOR PROFILES:', Object.keys(testData));
        console.log('Returned data structure:', Object.keys(data));
        console.log('Sample data:', data);
        
        // Clean up test record
        await supabase.from('profiles').delete().eq(Object.keys(testData)[0], 'test-id');
        break;
      } else {
        console.log('❌ Failed:', error.message);
      }
    } catch (e) {
      console.log('❌ Exception:', e.message);
    }
  }
}

discoverSchema();