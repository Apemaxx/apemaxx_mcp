import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWarehouseSchema() {
  console.log('🔍 Checking actual warehouse table schemas...');
  
  try {
    // Test with minimal data to see what columns are required
    console.log('\n📋 Testing warehouse_receipts with minimal data...');
    
    const { data: wrTest, error: wrError } = await supabase
      .from('warehouse_receipts')
      .insert([{
        receipt_number: 'TEST-001',
        description: 'Test description',
        quantity: 1,
        unit: 'Boxes',
        status: 'received',
        user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d2'
      }])
      .select();
    
    if (wrError) {
      console.log('❌ Warehouse receipts error:', wrError);
    } else {
      console.log('✅ Basic warehouse receipt created:', wrTest);
      
      // Clean up the test record
      if (wrTest && wrTest[0]) {
        await supabase
          .from('warehouse_receipts')
          .delete()
          .eq('id', wrTest[0].id);
        console.log('🧹 Test record cleaned up');
      }
    }

    // Test warehouse_receipt_attachments  
    console.log('\n📎 Testing warehouse_receipt_attachments with minimal data...');
    
    const { data: wraTest, error: wraError } = await supabase
      .from('warehouse_receipt_attachments')
      .insert([{
        warehouse_receipt_id: 1,
        file_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf',
        file_type: 'application/pdf',
        attachment_type: 'document',
        uploaded_by: 'ce50d88a-38ef-4749-9f38-1d61671616d2'
      }])
      .select();
    
    if (wraError) {
      console.log('❌ Warehouse attachments error:', wraError);
    } else {
      console.log('✅ Basic attachment created:', wraTest);
      
      // Clean up the test record
      if (wraTest && wraTest[0]) {
        await supabase
          .from('warehouse_receipt_attachments')
          .delete()
          .eq('id', wraTest[0].id);
        console.log('🧹 Test attachment cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkWarehouseSchema();