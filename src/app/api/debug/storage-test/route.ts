import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Supabase Storage...')
    
    // Test 1: List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('📦 Available buckets:', buckets?.map(b => b.name) || [])
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return NextResponse.json({ 
        error: 'Failed to list buckets', 
        details: bucketsError.message 
      }, { status: 500 })
    }

    // Test 2: Check if documents bucket exists
    const documentsBucket = buckets?.find(b => b.name === 'documents')
    console.log('📁 Documents bucket exists:', !!documentsBucket)

    // Test 3: Try to create a test file
    const testContent = JSON.stringify({ test: true, timestamp: new Date().toISOString() })
    const testPath = `test/storage-test-${Date.now()}.json`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(testPath, testContent, {
        contentType: 'application/json',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError)
      return NextResponse.json({
        success: false,
        buckets: buckets?.map(b => b.name) || [],
        documentsBucketExists: !!documentsBucket,
        uploadError: uploadError.message
      })
    }

    console.log('✅ Test file uploaded successfully:', uploadData)

    // Test 4: Try to list files in associations folder
    const { data: assocFiles, error: listError } = await supabase.storage
      .from('documents')
      .list('associations')

    return NextResponse.json({
      success: true,
      buckets: buckets?.map(b => b.name) || [],
      documentsBucketExists: !!documentsBucket,
      testFileUploaded: true,
      testFilePath: testPath,
      associationsFolder: {
        exists: !listError,
        files: assocFiles || [],
        error: listError?.message
      }
    })

  } catch (error) {
    console.error('🧪 Storage test failed:', error)
    return NextResponse.json({ 
      error: 'Storage test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}