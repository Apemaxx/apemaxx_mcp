import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverWarehouseTables() {
  console.log('🔍 Discovering actual warehouse table structures...');
  
  try {
    // Test basic select to see what columns exist
    console.log('\n1️⃣ Testing warehouse_receipts table structure...');
    const { data: receipts, error: receiptsError } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .limit(1);
    
    if (receiptsError) {
      console.log('❌ Error accessing warehouse_receipts:', receiptsError.message);
    } else {
      console.log('✅ warehouse_receipts table accessible');
      if (receipts && receipts.length > 0) {
        console.log('📋 Sample record structure:', Object.keys(receipts[0]));
        console.log('📋 Sample data:', receipts[0]);
      } else {
        console.log('📋 Table is empty, trying to infer structure with minimal insert...');
        
        // Try inserting with minimal required fields
        const { data: insertTest, error: insertError } = await supabase
          .from('warehouse_receipts')
          .insert([{}])
          .select();
        
        if (insertError) {
          console.log('💡 Insert error reveals required fields:', insertError.message);
        }
      }
    }

    console.log('\n2️⃣ Testing warehouse_receipt_attachments table structure...');
    const { data: attachments, error: attachmentsError } = await supabase
      .from('warehouse_receipt_attachments')
      .select('*')
      .limit(1);
    
    if (attachmentsError) {
      console.log('❌ Error accessing warehouse_receipt_attachments:', attachmentsError.message);
    } else {
      console.log('✅ warehouse_receipt_attachments table accessible');
      if (attachments && attachments.length > 0) {
        console.log('📎 Sample record structure:', Object.keys(attachments[0]));
        console.log('📎 Sample data:', attachments[0]);
      } else {
        console.log('📎 Table is empty, trying to infer structure...');
        
        const { data: insertTest, error: insertError } = await supabase
          .from('warehouse_receipt_attachments')
          .insert([{}])
          .select();
        
        if (insertError) {
          console.log('💡 Insert error reveals required fields:', insertError.message);
        }
      }
    }

    // Test if there are any existing warehouse receipts at all
    console.log('\n3️⃣ Checking for any existing warehouse data...');
    const { count: receiptCount, error: countError } = await supabase
      .from('warehouse_receipts')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📊 Total warehouse receipts in database: ${receiptCount}`);
    }

  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

discoverWarehouseTables();