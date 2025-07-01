import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWarehouseReceipt() {
  console.log('🧪 Testing warehouse receipt creation...');
  
  try {
    // Create a test warehouse receipt
    const { data: receipt, error: receiptError } = await supabase
      .from('warehouse_receipts')
      .insert([{
        receipt_number: 'WR-TEST-001',
        description: 'Test warehouse receipt for electronics shipment',
        quantity: 50,
        unit: 'Boxes',
        category: 'Electronics',
        status: 'received',
        supplier_name: 'Tech Components Ltd',
        received_date: new Date().toISOString(),
        inspection_notes: 'All items received in good condition',
        warehouse_location: 'A1-B2-C3',
        total_value: 25000.00,
        user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d' // Flavio's user ID
      }])
      .select()
      .single();

    if (receiptError) {
      console.log('❌ Warehouse receipt creation error:', receiptError);
      return;
    }

    console.log('✅ Warehouse receipt created successfully:', receipt);

    // Create a test attachment
    const { data: attachment, error: attachmentError } = await supabase
      .from('warehouse_receipt_attachments')
      .insert([{
        warehouse_receipt_id: receipt.id,
        file_name: 'invoice_WR-TEST-001.pdf',
        file_url: 'https://example.com/invoices/WR-TEST-001.pdf',
        file_size: 245760,
        file_type: 'application/pdf',
        attachment_type: 'invoice',
        uploaded_by: 'ce50d88a-38ef-4749-9f38-1d61671616d'
      }])
      .select()
      .single();

    if (attachmentError) {
      console.log('❌ Attachment creation error:', attachmentError);
    } else {
      console.log('✅ Attachment created successfully:', attachment);
    }

    console.log('🎉 Warehouse management system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWarehouseReceipt();