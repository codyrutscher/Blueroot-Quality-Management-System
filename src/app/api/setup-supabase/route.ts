import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { syncSuppliersFromCSV } from '../../../../lib/suppliers'

export async function GET() {
  try {
    console.log('🚀 Starting Supabase setup...')
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('suppliers')
      .select('count(*)')
      .limit(1)
    
    if (testError) {
      // Tables might not exist yet, let's create them
      console.log('📋 Tables not found, they may need to be created manually via SQL Editor')
      return NextResponse.json({
        success: false,
        error: 'Tables not found. Please run the SQL schema in Supabase SQL Editor first.',
        sqlFile: 'supabase-schema.sql'
      })
    }
    
    console.log('✅ Database connection successful!')
    
    // Check if suppliers exist
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(5)
    
    if (suppliersError) {
      return NextResponse.json({
        success: false,
        error: suppliersError.message
      })
    }
    
    let suppliersCount = suppliers?.length || 0
    
    // If no suppliers, sync from CSV
    if (suppliersCount === 0) {
      console.log('📥 No suppliers found, syncing from CSV...')
      const syncResult = await syncSuppliersFromCSV()
      
      if (!syncResult.success) {
        return NextResponse.json({
          success: false,
          error: `Failed to sync suppliers: ${syncResult.error}`
        })
      }
      
      suppliersCount = syncResult.data?.length || 0
      console.log(`✅ Synced ${suppliersCount} suppliers from CSV`)
    }
    
    // Check storage bucket
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.warn('⚠️ Storage check failed:', bucketError.message)
    }
    
    const supplierBucket = buckets?.find(bucket => bucket.name === 'supplier-documents')
    
    if (!supplierBucket) {
      console.log('📁 Creating supplier-documents bucket...')
      const { error: createBucketError } = await supabase.storage.createBucket('supplier-documents', {
        public: false,
        fileSizeLimit: 52428800 // 50MB
      })
      
      if (createBucketError) {
        console.warn('⚠️ Failed to create bucket:', createBucketError.message)
      } else {
        console.log('✅ Created supplier-documents bucket')
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase setup completed successfully!',
      details: {
        suppliersCount,
        bucketExists: !!supplierBucket,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Supabase setup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}