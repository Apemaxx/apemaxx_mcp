import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exploreWarehouseSchema() {
  console.log('🔍 Exploring warehouse schema...');
  
  try {
    // Try to insert and then delete a sample record to understand the schema
    console.log('\n📋 Testing warehouse_receipts schema...');
    
    // Insert a test record
    const { data: wrInsert, error: wrInsertError } = await supabase
      .from('warehouse_receipts')
      .insert([{
        receipt_number: 'WR-TEST-001',
        supplier_name: 'Test Supplier',
        received_date: new Date().toISOString(),
        status: 'pending',
        notes: 'Test record for schema discovery'
      }])
      .select();
    
    if (wrInsertError) {
      console.log('❌ Insert error reveals schema:', wrInsertError);
    } else {
      console.log('✅ Successfully inserted test record:', wrInsert);
      
      // Delete the test record
      const { error: deleteError } = await supabase
        .from('warehouse_receipts')
        .delete()
        .eq('receipt_number', 'WR-TEST-001');
      
      if (deleteError) {
        console.log('⚠️ Could not delete test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }

    // Test warehouse_receipt_attachments schema
    console.log('\n📎 Testing warehouse_receipt_attachments schema...');
    
    const { data: wraInsert, error: wraInsertError } = await supabase
      .from('warehouse_receipt_attachments')
      .insert([{
        warehouse_receipt_id: 1,
        file_name: 'test-file.pdf',
        file_url: 'https://example.com/test.pdf',
        file_size: 1024,
        file_type: 'application/pdf',
        uploaded_at: new Date().toISOString()
      }])
      .select();
    
    if (wraInsertError) {
      console.log('❌ Attachment insert error reveals schema:', wraInsertError);
    } else {
      console.log('✅ Successfully inserted test attachment:', wraInsert);
      
      // Delete the test record
      const { error: deleteError } = await supabase
        .from('warehouse_receipt_attachments')
        .delete()
        .eq('file_name', 'test-file.pdf');
      
      if (deleteError) {
        console.log('⚠️ Could not delete test attachment:', deleteError);
      } else {
        console.log('✅ Test attachment cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Error exploring schema:', error);
  }
}

exploreWarehouseSchema();