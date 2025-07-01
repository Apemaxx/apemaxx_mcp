import { createClient } from '@supabase/supabase-js';

async function discoverProfilesSchema() {
  const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('=== DISCOVERING PROFILES TABLE SCHEMA ===');
  
  // Try inserting with minimal required fields only
  const minimalTests = [
    { user_id: 'test-123' },
    { userId: 'test-123' },
    { uid: 'test-123' },
    { id: 'test-123' },
  ];
  
  console.log('\nTesting minimal required fields...');
  
  for (let i = 0; i < minimalTests.length; i++) {
    const testData = minimalTests[i];
    console.log('Testing minimal schema ' + (i + 1) + ':', Object.keys(testData));
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(testData)
        .select()
        .single();
      
      if (!error) {
        console.log('✅ SUCCESSFUL MINIMAL SCHEMA FOR PROFILES:', Object.keys(testData));
        console.log('Full returned structure:', Object.keys(data));
        console.log('Sample data:', data);
        
        // Clean up test record
        const firstKey = Object.keys(testData)[0];
        await supabase.from('profiles').delete().eq(firstKey, 'test-123');
        return;
      } else {
        console.log('❌ Failed:', error.message);
      }
    } catch (e) {
      console.log('❌ Exception:', e.message);
    }
  }
  
  console.log('\nNo minimal schema worked. The profiles table might have required fields.');
}

discoverProfilesSchema();