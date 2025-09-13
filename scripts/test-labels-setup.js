require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSetup() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      console.error('Connection test failed:', error)
      return
    }
    
    console.log('✅ Supabase connection successful')
    
    // Check if labels table exists by trying to query it
    const { data: labelsTest, error: tableError } = await supabase
      .from('labels')
      .select('count')
      .limit(1)
    
    if (tableError) {
      console.log('❌ Labels table does not exist:', tableError.message)
    } else {
      console.log('✅ Labels table exists')
    }
    
    // Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.error('Error checking storage buckets:', bucketError)
    } else {
      const documentsBucket = buckets.find(bucket => bucket.name === 'documents')
      if (documentsBucket) {
        console.log('✅ Documents storage bucket exists')
      } else {
        console.log('❌ Documents storage bucket does not exist')
      }
    }
    
  } catch (error) {
    console.error('Error testing setup:', error)
  }
}

testSetup()