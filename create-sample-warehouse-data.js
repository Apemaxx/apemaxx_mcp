import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DATABASE_URL?.split('@')[0]?.split('://')[1]?.split(':')[1] || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleData = [
  {
    user_id: 'ce50d88a-38ef-4749-9f38-1d616716162d',
    wr_number: 'WR23101',
    tracking_number: 'AWB789456123',
    status: 'received_on_hand',
    shipper_id: 1,
    consignee_id: 1,
    warehouse_location_id: 1,
    total_pieces: 25,
    total_weight_lb: 450.5,
    total_volume_ft3: 68.2,
    description: 'Electronics Components - Dell Monitors',
    received_date: new Date('2025-01-15'),
    expected_delivery: new Date('2025-01-22'),
    notes: 'Handle with care - fragile items'
  },
  {
    user_id: 'ce50d88a-38ef-4749-9f38-1d616716162d',
    wr_number: 'WR23102',
    tracking_number: 'AWB654321987',
    status: 'released_by_air',
    shipper_id: 2,
    consignee_id: 2,
    warehouse_location_id: 1,
    total_pieces: 12,
    total_weight_lb: 180.0,
    total_volume_ft3: 32.5,
    description: 'Home Appliances - Kitchen Equipment',
    received_date: new Date('2025-01-10'),
    expected_delivery: new Date('2025-01-18'),
    notes: 'Priority shipping requested'
  },
  {
    user_id: 'ce50d88a-38ef-4749-9f38-1d616716162d',
    wr_number: 'WR23103',
    tracking_number: 'AWB147258369',
    status: 'shipped',
    shipper_id: 3,
    consignee_id: 3,
    warehouse_location_id: 2,
    total_pieces: 8,
    total_weight_lb: 95.3,
    total_volume_ft3: 15.8,
    description: 'Office Supplies - Printer Equipment',
    received_date: new Date('2025-01-05'),
    expected_delivery: new Date('2025-01-15'),
    notes: 'Delivered successfully'
  },
  {
    user_id: 'ce50d88a-38ef-4749-9f38-1d616716162d',
    wr_number: 'WR23104',
    tracking_number: 'AWB963852741',
    status: 'received_on_hand',
    shipper_id: 1,
    consignee_id: 4,
    warehouse_location_id: 1,
    total_pieces: 35,
    total_weight_lb: 720.8,
    total_volume_ft3: 125.4,
    description: 'Automotive Parts - Car Components',
    received_date: new Date('2025-01-20'),
    expected_delivery: new Date('2025-01-28'),
    notes: 'Large shipment - requires special handling'
  }
];

async function createSampleData() {
  try {
    console.log('Creating sample warehouse receipt data...');
    
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .insert(sampleData)
      .select();
    
    if (error) {
      console.error('Error creating sample data:', error);
      return;
    }
    
    console.log('✅ Sample warehouse receipt data created successfully:', data.length, 'records');
    
    // Also verify the data was inserted
    const { data: count, error: countError } = await supabase
      .from('warehouse_receipts')
      .select('id', { count: 'exact' })
      .eq('user_id', 'ce50d88a-38ef-4749-9f38-1d616716162d');
    
    if (countError) {
      console.error('Error counting records:', countError);
    } else {
      console.log('✅ Total warehouse receipts for user:', count?.length || 0);
    }
    
  } catch (err) {
    console.error('Failed to create sample data:', err);
  }
}

createSampleData();