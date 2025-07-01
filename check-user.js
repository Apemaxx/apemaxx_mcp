import { createClient } from '@supabase/supabase-js';

async function checkUserData() {
  const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Checking user data structure...');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'ricardo.lopes@apemax.com')
    .single();
  
  if (data) {
    console.log('User data fields:', Object.keys(data));
    console.log('Password field value:', data.password ? '[PRESENT]' : '[MISSING/NULL]');
    console.log('Full data (masking password):', { 
      ...data, 
      password: data.password ? '[HIDDEN - ' + data.password.length + ' chars]' : '[MISSING]' 
    });
  } else {
    console.log('Error:', error);
  }
}

checkUserData();