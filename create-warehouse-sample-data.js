import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL?.replace('postgresql://', '')?.replace(/:[^:]*@/, '@')?.replace(/@([^:]+):(\d+)\/(.+)/, 'https://$1.supabase.co') || 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxbXB1cHltY2hhbm9ocGZ6Z2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwNjgzNjQsImV4cCI6MjAzNDY0NDM2NH0.VcGfVGgstaGhk5p-5dmI-qMOOD5PadQ46bJj39cyaXo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createWarehouseSampleData() {
  try {
    console.log('🏭 Creating warehouse sample data based on WR23303...');

    // Sample data based on the PDF provided by user
    const sampleReceipts = [
      {
        wr_number: 'WR23303',
        received_date: '2025-06-25T15:06:00.000Z',
        received_by: 'Manuel Acosta',
        shipper_name: 'AMAZON',
        shipper_address: '172 TRADE STREET, LEXINGTON, KY 40511, United States',
        consignee_name: 'AMASS GLOBAL NETWORK (US) Inc.',
        consignee_address: 'Cargo Building 75 Suite 200 North Hangar Road, JFK Intl Airport, JAMAICA, NY 11430, USA',
        carrier_name: 'AMAZON',
        driver_name: 'Amazon Driver',
        driver_license: '',
        tracking_number: 'TBA322325434471',
        total_pieces: 1,
        total_weight_lb: 1.00,
        total_weight_kg: 0.45,
        total_volume_ft3: 0.17,
        total_volume_m3: 0.0048,
        total_volume_vlb: 1.81,
        cargo_description: 'GENERAL CARGO',
        package_type: 'Package',
        dimensions_length: 15.00,
        dimensions_width: 10.00,
        dimensions_height: 2.00,
        warehouse_location_id: 'JFK',
        warehouse_location_code: 'JFK',
        warehouse_location_name: 'JFK International Airport',
        status: 'received_on_hand',
        charges_applied: null,
        invoice_number: '',
        po_number: '',
        notes: '',
        created_at: '2025-06-25T15:06:00.000Z',
        updated_at: '2025-06-25T15:06:00.000Z'
      },
      {
        wr_number: 'WR23304',
        received_date: '2025-06-26T10:30:00.000Z',
        received_by: 'Carlos Rodriguez',
        shipper_name: 'INTCOMEX',
        shipper_address: '3505 NW 107th Ave, Miami, FL 33178, United States',
        consignee_name: 'BEST BUY DISTRIBUTION CENTER',
        consignee_address: '7601 Penn Ave S, Richfield, MN 55423, United States',
        carrier_name: 'FEDEX',
        driver_name: 'FedEx Driver',
        driver_license: 'FL123456',
        tracking_number: 'FDX789456123789',
        total_pieces: 5,
        total_weight_lb: 45.50,
        total_weight_kg: 20.64,
        total_volume_ft3: 3.75,
        total_volume_m3: 0.106,
        total_volume_vlb: 132.5,
        cargo_description: 'ELECTRONICS - COMPUTER COMPONENTS',
        package_type: 'Box',
        dimensions_length: 24.00,
        dimensions_width: 18.00,
        dimensions_height: 12.00,
        warehouse_location_id: 'MIA',
        warehouse_location_code: 'MIA',
        warehouse_location_name: 'Miami Warehouse',
        status: 'released_by_air',
        charges_applied: null,
        invoice_number: 'INV-2025-001234',
        po_number: 'PO-BB-789456',
        notes: 'Handle with care - fragile electronics',
        created_at: '2025-06-26T10:30:00.000Z',
        updated_at: '2025-06-26T11:15:00.000Z'
      },
      {
        wr_number: 'WR23305',
        received_date: '2025-06-27T08:45:00.000Z',
        received_by: 'Maria Santos',
        shipper_name: 'GLASDON INC',
        shipper_address: '9025 Marshall Ct, Westminster, CO 80031, United States',
        consignee_name: 'HOME DEPOT SUPPLY CHAIN',
        consignee_address: '2455 Paces Ferry Rd NW, Atlanta, GA 30339, United States',
        carrier_name: 'UPS',
        driver_name: 'UPS Driver',
        driver_license: 'CO789123',
        tracking_number: 'UPS1Z456789123456',
        total_pieces: 12,
        total_weight_lb: 185.75,
        total_weight_kg: 84.25,
        total_volume_ft3: 15.50,
        total_volume_m3: 0.439,
        total_volume_vlb: 547.2,
        cargo_description: 'OUTDOOR FURNITURE COMPONENTS',
        package_type: 'Pallet',
        dimensions_length: 48.00,
        dimensions_width: 40.00,
        dimensions_height: 36.00,
        warehouse_location_id: 'LAX',
        warehouse_location_code: 'LAX',
        warehouse_location_name: 'Los Angeles Warehouse',
        status: 'released_by_ocean',
        charges_applied: null,
        invoice_number: 'INV-GL-2025-567',
        po_number: 'PO-HD-123789',
        notes: 'Oversized items - dock level delivery required',
        created_at: '2025-06-27T08:45:00.000Z',
        updated_at: '2025-06-27T14:20:00.000Z'
      },
      {
        wr_number: 'WR23306',
        received_date: '2025-06-28T13:20:00.000Z',
        received_by: 'David Kim',
        shipper_name: 'APPLE INC',
        shipper_address: '1 Apple Park Way, Cupertino, CA 95014, United States',
        consignee_name: 'AMASS GLOBAL NETWORK (US) Inc.',
        consignee_address: 'Cargo Building 75 Suite 200 North Hangar Road, JFK Intl Airport, JAMAICA, NY 11430, USA',
        carrier_name: 'DHL',
        driver_name: 'DHL Express',
        driver_license: 'CA456789',
        tracking_number: 'DHL123456789012',
        total_pieces: 8,
        total_weight_lb: 67.25,
        total_weight_kg: 30.50,
        total_volume_ft3: 4.85,
        total_volume_m3: 0.137,
        total_volume_vlb: 171.0,
        cargo_description: 'CONSUMER ELECTRONICS - IPHONES',
        package_type: 'Box',
        dimensions_length: 20.00,
        dimensions_width: 16.00,
        dimensions_height: 10.00,
        warehouse_location_id: 'JFK',
        warehouse_location_code: 'JFK',
        warehouse_location_name: 'JFK International Airport',
        status: 'shipped',
        charges_applied: null,
        invoice_number: 'INV-APL-2025-890',
        po_number: 'PO-AMASS-456123',
        notes: 'High value cargo - secure handling required',
        created_at: '2025-06-28T13:20:00.000Z',
        updated_at: '2025-06-28T16:45:00.000Z'
      },
      {
        wr_number: 'WR23307',
        received_date: '2025-06-29T11:10:00.000Z',
        received_by: 'Ana Rodriguez',
        shipper_name: 'SAMSUNG ELECTRONICS',
        shipper_address: '85 Challenger Rd, Ridgefield Park, NJ 07660, United States',
        consignee_name: 'COSTCO WHOLESALE',
        consignee_address: '999 Lake Dr, Issaquah, WA 98027, United States',
        carrier_name: 'AMAZON LOGISTICS',
        driver_name: 'Amazon Logistics',
        driver_license: 'NJ321654',
        tracking_number: 'AMZ987654321098',
        total_pieces: 25,
        total_weight_lb: 312.80,
        total_weight_kg: 141.91,
        total_volume_ft3: 28.75,
        total_volume_m3: 0.814,
        total_volume_vlb: 1015.0,
        cargo_description: 'SMART TVS AND HOME APPLIANCES',
        package_type: 'Pallet',
        dimensions_length: 60.00,
        dimensions_width: 48.00,
        dimensions_height: 42.00,
        warehouse_location_id: 'ORD',
        warehouse_location_code: 'ORD',
        warehouse_location_name: 'Chicago Warehouse',
        status: 'received_on_hand',
        charges_applied: null,
        invoice_number: 'INV-SAM-2025-147',
        po_number: 'PO-COS-789654',
        notes: 'Large appliances - forklift required for handling',
        created_at: '2025-06-29T11:10:00.000Z',
        updated_at: '2025-06-29T11:10:00.000Z'
      }
    ];

    // Get user ID (Flavio Campos)
    const userId = 'ce50d88a-38ef-4749-9f38-1d616716162d';

    console.log('📦 Inserting warehouse receipts...');
    for (const receipt of sampleReceipts) {
      const { data, error } = await supabase
        .from('warehouse_receipts')
        .insert([{
          ...receipt,
          user_id: userId
        }]);

      if (error) {
        console.error(`❌ Error inserting ${receipt.wr_number}:`, error);
      } else {
        console.log(`✅ Created ${receipt.wr_number} - ${receipt.shipper_name} to ${receipt.consignee_name}`);
      }
    }

    // Calculate and display totals
    const totalPieces = sampleReceipts.reduce((sum, r) => sum + r.total_pieces, 0);
    const totalWeight = sampleReceipts.reduce((sum, r) => sum + r.total_weight_lb, 0);
    const totalVolume = sampleReceipts.reduce((sum, r) => sum + r.total_volume_ft3, 0);

    console.log('\n📊 WAREHOUSE INVENTORY SUMMARY:');
    console.log(`Total WR Records: ${sampleReceipts.length}`);
    console.log(`Total Pieces: ${totalPieces}`);
    console.log(`Total Weight: ${totalWeight.toFixed(2)} lbs (${(totalWeight * 0.453592).toFixed(2)} kg)`);
    console.log(`Total Volume: ${totalVolume.toFixed(2)} ft³ (${(totalVolume * 0.0283168).toFixed(3)} m³)`);
    console.log('\n🏭 Warehouse sample data created successfully!');

  } catch (error) {
    console.error('❌ Error creating warehouse sample data:', error);
  }
}

createWarehouseSampleData();