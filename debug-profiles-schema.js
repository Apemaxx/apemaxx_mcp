import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesSchema() {
  try {
    console.log('🔍 Checking profiles table schema...');
    
    // Try to get a profile to see the actual column structure
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching profile:', error);
      console.log('📋 Available tables, let me check:');
      
      // Check all tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (tablesError) {
        console.error('Error checking tables:', tablesError);
      } else {
        console.log('Tables:', tables);
      }
    } else {
      console.log('✅ Profile sample data:', profile);
      if (profile && profile.length > 0) {
        console.log('📋 Column names in profiles table:');
        Object.keys(profile[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof profile[0][key]}`);
        });
      }
    }

    // Check for existing user profile
    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', 'ce50d88a-38ef-4749-9f38-1d616716162d');

    if (existingError) {
      console.log('❌ Error with userId column:', existingError.message);
      
      // Try with user_id instead
      const { data: existingProfile2, error: existingError2 } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', 'ce50d88a-38ef-4749-9f38-1d616716162d');
        
      if (existingError2) {
        console.log('❌ Error with user_id column:', existingError2.message);
      } else {
        console.log('✅ Found profile with user_id:', existingProfile2);
      }
    } else {
      console.log('✅ Found profile with userId:', existingProfile);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProfilesSchema();