import { Client } from 'pg';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('📋 Connection string format:', connectionString?.substring(0, 50) + '...');
  
  if (!connectionString) {
    console.log('❌ No DATABASE_URL found');
    return;
  }
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('📊 Testing basic query...');
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);
    
    console.log('📋 Listing existing tables...');
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    console.log('📂 Existing tables:', tables.rows.map(r => r.tablename));
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    if (error.code) {
      console.log('📋 Error code:', error.code);
    }
  } finally {
    await client.end();
  }
}

testSupabaseConnection();