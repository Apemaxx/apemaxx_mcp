import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqmpupymchanohpfzglw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabase.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);

async function checkUserData() {
  console.log('🔍 Checking available users and their structure...');
  
  try {
    // Check users in auth.users
    console.log('\n1️⃣ Checking auth.users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error accessing users:', usersError.message);
    } else {
      console.log('✅ Users found:', users.users.length);
      users.users.forEach(user => {
        console.log(`📧 User: ${user.email} (${user.id})`);
      });
    }

    // Check profiles table
    console.log('\n2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Error accessing profiles:', profilesError.message);
    } else {
      console.log('✅ Profiles found:', profiles.length);
      profiles.forEach(profile => {
        console.log(`👤 Profile: ${profile.first_name} ${profile.last_name} (${profile.id})`);
      });
    }

    // Test with the first available user
    if (users && users.users.length > 0) {
      const testUser = users.users[0];
      console.log(`\n3️⃣ Testing warehouse functionality with user: ${testUser.email}`);
      
      // Impersonate the user (if service role key is available)
      const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: testUser.email
      });
      
      if (!authError) {
        console.log('✅ Can generate auth link for user');
        
        // Test direct warehouse insert with user ID
        const { data: receipt, error: receiptError } = await supabase
          .from('warehouse_receipts')
          .insert([{
            user_id: testUser.id,
            receipt_number: 'WR-' + Date.now()
          }])
          .select();
        
        if (receiptError) {
          console.log('❌ Warehouse receipt creation failed:', receiptError.message);
        } else {
          console.log('✅ Warehouse receipt created successfully:', receipt);
        }
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUserData();