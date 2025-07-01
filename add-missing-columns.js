import { createClient } from '@supabase/supabase-js';

async function addMissingColumns() {
  const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Adding missing columns to shipments table...');
  
  // Try to add estimated_cost column
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE shipments ADD COLUMN estimated_cost DECIMAL(10,2);'
    });
    
    if (error) {
      console.log('Note: estimated_cost column might already exist or RPC not available:', error.message);
    } else {
      console.log('✅ Added estimated_cost column');
    }
  } catch (e) {
    console.log('Note: Could not add estimated_cost column via RPC:', e.message);
  }
  
  // Try to add is_on_time column
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE shipments ADD COLUMN is_on_time BOOLEAN DEFAULT false;'
    });
    
    if (error) {
      console.log('Note: is_on_time column might already exist or RPC not available:', error.message);
    } else {
      console.log('✅ Added is_on_time column');
    }
  } catch (e) {
    console.log('Note: Could not add is_on_time column via RPC:', e.message);
  }
  
  // Test if we can now insert a shipment with these columns
  console.log('\nTesting insert with new columns...');
  const { data: testData, error: testError } = await supabase
    .from('shipments')
    .insert({
      tracking_number: 'TEST456',
      origin: 'Miami',
      destination: 'Santos',
      status: 'pending',
      carrier: 'Test Carrier',
      estimated_cost: 1500.00,
      is_on_time: true,
      user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d' // Use a real user ID
    })
    .select()
    .single();
  
  if (testError) {
    console.log('❌ Test insert failed:', testError.message);
  } else {
    console.log('✅ Test insert successful:', Object.keys(testData));
    // Clean up
    await supabase.from('shipments').delete().eq('tracking_number', 'TEST456');
  }
}

addMissingColumns().catch(console.error);
