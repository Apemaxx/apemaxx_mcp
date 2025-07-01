import { createClient } from '@supabase/supabase-js';

async function discoverShipmentsSchema() {
  const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODM5NjMsImV4cCI6MjA2NjA1OTk2M30.qzAzCzWR7718n_tC8ku2Hv07B8w52lZsPt2VbwBDSFs';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('=== DISCOVERING SHIPMENTS TABLE SCHEMA ===');
  
  // First, try to get any existing shipment to see the schema
  const { data: existingShipments, error: selectError } = await supabase
    .from('shipments')
    .select('*')
    .limit(1);
  
  if (selectError) {
    console.log('Error selecting from shipments:', selectError);
  } else if (existingShipments && existingShipments.length > 0) {
    console.log('✅ Existing shipment columns:', Object.keys(existingShipments[0]));
    console.log('Sample data:', existingShipments[0]);
  } else {
    console.log('No existing shipments found, will try inserting test data...');
    
    // Try different possible schemas
    const testShipmentSchemas = [
      {
        tracking_number: 'TEST123',
        origin: 'Miami',
        destination: 'Santos',
        status: 'pending',
        carrier: 'Test Carrier',
        user_id: 'test-user-id'
      },
      {
        trackingNumber: 'TEST123',
        origin: 'Miami', 
        destination: 'Santos',
        status: 'pending',
        carrier: 'Test Carrier',
        userId: 'test-user-id'
      },
      {
        tracking_number: 'TEST123',
        origin: 'Miami',
        destination: 'Santos', 
        status: 'pending',
        carrier: 'Test Carrier',
        estimated_cost: 1000,
        is_on_time: true,
        user_id: 'test-user-id'
      }
    ];
    
    for (let i = 0; i < testShipmentSchemas.length; i++) {
      const testData = testShipmentSchemas[i];
      console.log(`\nTesting shipments schema ${i + 1}:`, Object.keys(testData));
      
      try {
        const { data, error } = await supabase
          .from('shipments')
          .insert(testData)
          .select()
          .single();
        
        if (!error && data) {
          console.log('✅ SUCCESSFUL SCHEMA FOR SHIPMENTS:', Object.keys(testData));
          console.log('Returned data structure:', Object.keys(data));
          console.log('Sample data:', data);
          
          // Clean up test record
          await supabase.from('shipments').delete().eq('tracking_number', 'TEST123');
          break;
        } else {
          console.log('❌ Failed:', error?.message || 'Unknown error');
        }
      } catch (e) {
        console.log('❌ Exception:', e.message);
      }
    }
  }
  
  // Also check bookings table
  console.log('\n=== DISCOVERING BOOKINGS TABLE SCHEMA ===');
  const { data: existingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1);
  
  if (bookingsError) {
    console.log('Error selecting from bookings:', bookingsError);
  } else if (existingBookings && existingBookings.length > 0) {
    console.log('✅ Existing booking columns:', Object.keys(existingBookings[0]));
  } else {
    console.log('No existing bookings found');
  }
}

discoverShipmentsSchema();
