import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverActualSchema() {
  console.log('🔍 Discovering actual table structure by attempting basic operations...');
  
  try {
    // Try to select from warehouse_receipts to see if table exists at all
    console.log('\n📋 Testing basic select on warehouse_receipts...');
    const { data: wrSelect, error: wrSelectError } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .limit(1);
    
    if (wrSelectError) {
      console.log('❌ Select error on warehouse_receipts:', wrSelectError);
    } else {
      console.log('✅ warehouse_receipts table exists, sample:', wrSelect);
    }

    // Try to select from warehouse_receipt_attachments
    console.log('\n📎 Testing basic select on warehouse_receipt_attachments...');
    const { data: wraSelect, error: wraSelectError } = await supabase
      .from('warehouse_receipt_attachments')
      .select('*')
      .limit(1);
    
    if (wraSelectError) {
      console.log('❌ Select error on warehouse_receipt_attachments:', wraSelectError);
    } else {
      console.log('✅ warehouse_receipt_attachments table exists, sample:', wraSelect);
    }

    // Try the most basic insert with just core fields that should exist
    console.log('\n🧪 Testing minimal insert on warehouse_receipts...');
    const { data: basicInsert, error: basicError } = await supabase
      .from('warehouse_receipts')
      .insert([{
        id: 999999,  // Use a high ID to avoid conflicts
      }])
      .select();
    
    if (basicError) {
      console.log('❌ Basic insert error reveals required fields:', basicError);
    } else {
      console.log('✅ Basic insert succeeded:', basicInsert);
    }

  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

discoverActualSchema();