import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWarehouseReceipt() {
  console.log('🧪 Testing warehouse receipt functionality with authentication...');
  
  try {
    // First, sign in as the user
    const userEmail = 'fafgcus@gmail.com';
    const userPassword = 'Flavio123!';
    
    console.log('🔐 Signing in user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
      return;
    }
    
    console.log('✅ User signed in successfully:', authData.user.email);
    
    // Now test warehouse receipt creation with basic fields
    console.log('\n📋 Testing warehouse receipt creation...');
    
    // Try creating with just the most basic fields
    const { data: receipt, error: receiptError } = await supabase
      .from('warehouse_receipts')
      .insert([{
        user_id: authData.user.id,
        receipt_number: 'WR-TEST-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (receiptError) {
      console.log('❌ Basic warehouse receipt creation failed:', receiptError.message);
      console.log('🔍 Error details:', receiptError);
      
      // Try with even more minimal fields
      console.log('\n🔍 Trying with minimal fields...');
      const { data: minimalReceipt, error: minimalError } = await supabase
        .from('warehouse_receipts')
        .insert([{
          user_id: authData.user.id
        }])
        .select();
      
      if (minimalError) {
        console.log('❌ Minimal insert failed:', minimalError.message);
      } else {
        console.log('✅ Minimal insert succeeded:', minimalReceipt);
      }
    } else {
      console.log('✅ Warehouse receipt created successfully:', receipt);
      
      // Test creating an attachment
      console.log('\n📎 Testing warehouse receipt attachment...');
      const { data: attachment, error: attachmentError } = await supabase
        .from('warehouse_receipt_attachments')
        .insert([{
          warehouse_receipt_id: receipt.id,
          file_name: 'test-invoice.pdf',
          file_url: 'https://example.com/test-invoice.pdf',
          uploaded_by: authData.user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (attachmentError) {
        console.log('❌ Attachment creation failed:', attachmentError.message);
      } else {
        console.log('✅ Attachment created successfully:', attachment);
      }
    }
    
    // Test reading warehouse receipts
    console.log('\n📖 Testing warehouse receipt reading...');
    const { data: allReceipts, error: readError } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .limit(5);
    
    if (readError) {
      console.log('❌ Reading warehouse receipts failed:', readError.message);
    } else {
      console.log('✅ Read warehouse receipts:', allReceipts);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWarehouseReceipt();