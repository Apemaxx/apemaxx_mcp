import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function exploreWarehouseSchema() {
  console.log('🔍 Exploring warehouse table schema through error analysis...');
  
  try {
    // Sign in the user first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ User not authenticated. Testing table structure without auth...');
    } else {
      console.log('✅ User authenticated:', user.email);
    }

    // Try creating warehouse receipt with different field combinations
    console.log('\n1️⃣ Testing minimal warehouse receipt fields...');
    
    const testFields = [
      { user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d2' },
      { user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d2', receipt_number: 'WR-TEST-001' },
      { 
        user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d2', 
        receipt_number: 'WR-TEST-002',
        description: 'Test receipt'
      },
      {
        user_id: 'ce50d88a-38ef-4749-9f38-1d61671616d2',
        receipt_number: 'WR-TEST-003',
        description: 'Test receipt with quantity',
        quantity: 10
      }
    ];

    for (const [index, fields] of testFields.entries()) {
      console.log(`\n📋 Test ${index + 1}: Fields:`, Object.keys(fields));
      
      const { data, error } = await supabase
        .from('warehouse_receipts')
        .insert([fields])
        .select();
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log(`🔍 Error code: ${error.code}`);
        console.log(`🔍 Error details:`, error.details);
      } else {
        console.log(`✅ Success! Created:`, data);
        
        // Clean up the test record
        if (data && data[0]) {
          await supabase
            .from('warehouse_receipts')
            .delete()
            .eq('id', data[0].id);
        }
        break; // Stop on first success
      }
    }

    // Test attachments table
    console.log('\n2️⃣ Testing warehouse attachments fields...');
    
    const attachmentFields = [
      { 
        warehouse_receipt_id: 'dummy',
        file_name: 'test.pdf'
      },
      {
        warehouse_receipt_id: 'dummy',
        file_name: 'test.pdf',
        file_url: 'https://example.com/test.pdf',
        uploaded_by: 'ce50d88a-38ef-4749-9f38-1d61671616d2'
      }
    ];

    for (const [index, fields] of attachmentFields.entries()) {
      console.log(`\n📎 Attachment test ${index + 1}: Fields:`, Object.keys(fields));
      
      const { data, error } = await supabase
        .from('warehouse_receipt_attachments')
        .insert([fields])
        .select();
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        console.log(`🔍 Error code: ${error.code}`);
      } else {
        console.log(`✅ Success! Created:`, data);
        break;
      }
    }

  } catch (error) {
    console.error('❌ Exploration failed:', error);
  }
}

exploreWarehouseSchema();