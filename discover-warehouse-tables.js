import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverWarehouseTables() {
  console.log('🔍 Discovering warehouse tables schema...');
  
  try {
    // Check warehouse_receipts table
    console.log('\n📋 Checking warehouse_receipts table...');
    const { data: wrData, error: wrError } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .limit(1);
    
    if (wrError) {
      console.log('⚠️ warehouse_receipts error:', wrError);
    } else {
      console.log('✅ warehouse_receipts table exists');
      if (wrData && wrData.length > 0) {
        console.log('📊 Sample warehouse receipt:', JSON.stringify(wrData[0], null, 2));
      } else {
        console.log('📊 warehouse_receipts table is empty');
      }
    }

    // Check warehouse_receipt_attachments table
    console.log('\n📎 Checking warehouse_receipt_attachments table...');
    const { data: wraData, error: wraError } = await supabase
      .from('warehouse_receipt_attachments')
      .select('*')
      .limit(1);
    
    if (wraError) {
      console.log('⚠️ warehouse_receipt_attachments error:', wraError);
    } else {
      console.log('✅ warehouse_receipt_attachments table exists');
      if (wraData && wraData.length > 0) {
        console.log('📊 Sample attachment:', JSON.stringify(wraData[0], null, 2));
      } else {
        console.log('📊 warehouse_receipt_attachments table is empty');
      }
    }

    // Try to get table schema info
    console.log('\n🔍 Attempting to get table columns...');
    
    // Get all tables to see what's available
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('⚠️ Could not fetch table list:', tablesError);
    } else {
      console.log('📋 Available tables:', tables?.map(t => t.table_name));
    }

  } catch (error) {
    console.error('❌ Error discovering warehouse tables:', error);
  }
}

discoverWarehouseTables();