import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY2ODcsImV4cCI6MjA2NjUxMjY4N30.VnlHnThWyiSC4f2wX7iDl1wAmqiS0Fv0FowBTGmKa-8';

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

    // Get all profiles to see structure
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
      
    if (allError) {
      console.log('❌ Error getting all profiles:', allError.message);
    } else {
      console.log('✅ All profiles data:', allProfiles);
      if (allProfiles && allProfiles.length > 0) {
        console.log('📋 Columns in profiles table:');
        Object.keys(allProfiles[0]).forEach(key => {
          console.log(`  - ${key}: ${typeof allProfiles[0][key]} = ${allProfiles[0][key]}`);
        });
      }
    }
    
    // Create a profile for Flavio if it doesn't exist
    console.log('🔧 Creating profile for Flavio Campos...');
    
    const profileData = {
      id: 'ce50d88a-38ef-4749-9f38-1d616716162d', // Use the user ID as profile ID
      name: 'Flavio Campos',
      email: 'fafgcus@gmail.com',
      phone: '19546693524',
      company: 'APE Global',
      job_title: 'Operations Manager',
      bio: 'Logistics operations expert specializing in freight management and supply chain optimization.',
      location: 'Miami, FL',
      website: 'https://apeglobal.io',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();
      
    if (createError) {
      console.log('❌ Error creating profile:', createError.message);
    } else {
      console.log('✅ Profile created successfully:', newProfile);
    }
    
    // Try different possible user ID column names
    const possibleColumns = ['id', 'userId', 'user_id', 'auth_user_id', 'supabase_user_id'];
    
    for (const column of possibleColumns) {
      try {
        const { data: testProfile, error: testError } = await supabase
          .from('profiles')
          .select('*')
          .eq(column, 'ce50d88a-38ef-4749-9f38-1d616716162d')
          .limit(1);
          
        if (!testError && testProfile) {
          console.log(`✅ Found profile using column '${column}':`, testProfile);
          break;
        } else if (testError) {
          console.log(`❌ Column '${column}' error: ${testError.message}`);
        } else {
          console.log(`⚪ Column '${column}' exists but no matching record`);
        }
      } catch (e) {
        console.log(`❌ Exception testing column '${column}':`, e.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkProfilesSchema();