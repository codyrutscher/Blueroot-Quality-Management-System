import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Supabase connection successful!')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function setupDatabase() {
  try {
    // Check if suppliers table exists and has data
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Database setup error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Database tables accessible!')
    console.log(`Found ${suppliers?.length || 0} suppliers`)
    
    return { success: true, suppliersCount: suppliers?.length || 0 }
  } catch (error) {
    console.error('Database setup failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function checkStorageBucket() {
  try {
    // Check if storage bucket exists
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('Storage check error:', error)
      return { success: false, error: error.message }
    }

    const supplierBucket = data?.find(bucket => bucket.name === 'supplier-documents')
    
    if (supplierBucket) {
      console.log('✅ Storage bucket "supplier-documents" exists!')
      return { success: true, bucketExists: true }
    } else {
      console.log('ℹ️ Storage bucket "supplier-documents" not found - will create automatically')
      return { success: true, bucketExists: false }
    }
  } catch (error) {
    console.error('Storage check failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}