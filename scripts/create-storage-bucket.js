require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDocumentsBucket() {
  try {
    console.log('Creating documents storage bucket...')
    
    // Create the documents bucket
    const { data, error } = await supabase.storage.createBucket('documents', {
      public: false,
      allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
    })
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Documents bucket already exists')
      } else {
        console.error('Error creating documents bucket:', error)
      }
    } else {
      console.log('✅ Documents bucket created successfully')
    }
    
    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('Error listing buckets:', listError)
    } else {
      const documentsBucket = buckets.find(bucket => bucket.name === 'documents')
      if (documentsBucket) {
        console.log('✅ Documents bucket is accessible')
      } else {
        console.log('❌ Documents bucket not found in list')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createDocumentsBucket()