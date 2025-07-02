// Create sample warehouse receipts matching your described inventory
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  'https://bqmpupymchanohpfzglw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MzY2ODcsImV4cCI6MjA2NjUxMjY4N30.VnlHnThWyiSC4f2wX7iDl1wAmqiS0Fv0FowBTGmKa-8'
)

const userId = 'ce50d88a-38ef-4749-9f38-1d616716162d'; // Your user ID

async function createWarehouseReceipts() {
  console.log('🏗️ Creating warehouse receipts...');

  const receipts = [
    {
      user_id: userId,
      wr_number: 'WR23183',
      tracking_number: 'AWB001234567',
      status: 'received_on_hand',
      warehouse_location_name: 'JFK International Airport',
      shipper_name: 'INTCOMEX Corporation',
      shipper_address: '3250 NW 72nd Ave, Miami, FL 33122',
      consignee_name: 'AMAZON LOGISTICS',
      consignee_address: '1200 12th Ave S, Seattle, WA 98144',
      total_pieces: 2,
      total_weight_lb: 125.50,
      total_volume_ft3: 28.75,
      description: 'Electronic components and accessories',
      category: 'Electronics'
    },
    {
      user_id: userId,
      wr_number: 'WR23201',
      tracking_number: 'AWB002345678',
      status: 'received_on_hand',
      warehouse_location_name: 'JFK International Airport',
      shipper_name: 'GLASDON INC',
      shipper_address: '2900 Exeter Rd, Casper, WY 82601',
      consignee_name: 'HOME DEPOT SUPPLY',
      consignee_address: '2455 Paces Ferry Rd NW, Atlanta, GA 30339',
      total_pieces: 3,
      total_weight_lb: 187.25,
      total_volume_ft3: 42.30,
      description: 'Industrial equipment and tools',
      category: 'Industrial'
    },
    {
      user_id: userId,
      wr_number: 'WR23242',
      tracking_number: 'AWB003456789',
      status: 'received_on_hand',
      warehouse_location_name: 'JFK International Airport',
      shipper_name: 'BEST BUY DISTRIBUTION',
      shipper_address: '7601 Penn Ave S, Richfield, MN 55423',
      consignee_name: 'TECH SOLUTIONS INC',
      consignee_address: '1500 Broadway, New York, NY 10036',
      total_pieces: 1,
      total_weight_lb: 45.75,
      total_volume_ft3: 15.20,
      description: 'Consumer electronics',
      category: 'Electronics'
    },
    {
      user_id: userId,
      wr_number: 'WR23279',
      tracking_number: 'AWB004567890',
      status: 'received_on_hand',
      warehouse_location_name: 'JFK International Airport',
      shipper_name: 'AMAZON WAREHOUSE',
      shipper_address: '1 Jeff Bezos Way, Seattle, WA 98109',
      consignee_name: 'LOGISTICS PLUS',
      consignee_address: '1441 Peach St, Erie, PA 16501',
      total_pieces: 2,
      total_weight_lb: 98.30,
      total_volume_ft3: 32.15,
      description: 'Fulfillment center inventory',
      category: 'General'
    },
    {
      user_id: userId,
      wr_number: 'WR23303',
      tracking_number: 'AWB005678901',
      status: 'received_on_hand',
      warehouse_location_name: 'JFK International Airport',
      shipper_name: 'GLOBAL SUPPLY CHAIN',
      shipper_address: '5000 Corporate Dr, Pittsburgh, PA 15237',
      consignee_name: 'DISTRIBUTION CENTER',
      consignee_address: '8500 Commerce Dr, Dallas, TX 75201',
      total_pieces: 2,
      total_weight_lb: 139.22,
      total_volume_ft3: 33.15,
      description: 'Mixed cargo shipment',
      category: 'Mixed'
    }
  ];

  try {
    console.log('📋 Inserting', receipts.length, 'warehouse receipts...');
    
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .insert(receipts)
      .select();

    if (error) {
      console.error('❌ Error inserting warehouse receipts:', error);
      
      // Try alternative approach - check if table exists first
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%warehouse%');
      
      if (tableError) {
        console.error('❌ Error checking tables:', tableError);
      } else {
        console.log('📋 Available warehouse tables:', tables);
      }
    } else {
      console.log('✅ Successfully created', data?.length || 0, 'warehouse receipts');
      console.log('📊 Total inventory: 10 pieces, 596.02 lbs, 151.55 ft³');
      
      // Verify data
      const { data: verification, error: verifyError } = await supabase
        .from('warehouse_receipts')
        .select('*')
        .eq('user_id', userId);
      
      if (verifyError) {
        console.error('❌ Error verifying data:', verifyError);
      } else {
        console.log('✅ Verification: Found', verification?.length || 0, 'receipts in database');
      }
    }
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createWarehouseReceipts()
  .then(() => console.log('🎉 Warehouse receipt creation complete'))
  .catch(err => console.error('❌ Script failed:', err));