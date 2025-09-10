import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST() {
  try {
    console.log('🪣 Creating supplier-documents bucket...')
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      return NextResponse.json({
        success: false,
        error: `Failed to list buckets: ${listError.message}`
      })
    }
    
    const existingBucket = buckets?.find(bucket => bucket.name === 'supplier-documents')
    
    if (existingBucket) {
      return NextResponse.json({
        success: true,
        message: 'Bucket already exists',
        bucket: existingBucket
      })
    }
    
    // Create the bucket
    const { data: newBucket, error: createError } = await supabase.storage.createBucket('supplier-documents', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: undefined // Allow all file types
    })
    
    if (createError) {
      return NextResponse.json({
        success: false,
        error: `Failed to create bucket: ${createError.message}`
      })
    }
    
    console.log('✅ Successfully created supplier-documents bucket')
    
    return NextResponse.json({
      success: true,
      message: 'Bucket created successfully',
      bucket: newBucket
    })
    
  } catch (error) {
    console.error('❌ Bucket creation failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}