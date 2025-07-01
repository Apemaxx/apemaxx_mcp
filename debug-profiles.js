import { createClient } from '@supabase/supabase-js';

async function discoverProfilesSchema() {
  const supabase = createClient(
    'https://bqmpupymchanohpfzglw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs'
  );

  try {
    console.log('🔍 Discovering profiles table schema...');
    
    // Try to get one profile to see the actual structure
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (profiles && profiles[0]) {
      console.log('✅ Profile schema:');
      console.log('Available columns:', Object.keys(profiles[0]));
      console.log('Sample profile:', profiles[0]);
    } else {
      console.log('📋 No profiles found, trying to get table info...');
    }

    // Also try getting the user-specific profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'ce50d88a-38ef-4749-9f38-1d6167161620');  // Your user ID

    if (userProfile && userProfile[0]) {
      console.log('👤 Your profile:', userProfile[0]);
    } else if (userError) {
      console.log('❌ User profile error:', userError);
    }

  } catch (error) {
    console.error('❌ Error discovering schema:', error);
  }
}

discoverProfilesSchema();