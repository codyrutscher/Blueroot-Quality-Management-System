import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking document_associations table structure...')
    
    // Try to get table info using a simple query
    const { data, error } = await supabase
      .from('document_associations')
      .select('*')
      .limit(0)

    if (error) {
      console.error('❌ Error checking table:', error)
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    // Also try a simple insert to see what columns are expected
    const testRecord = {
      document_id: 'test',
      document_filename: 'test.pdf',
      document_title: 'Test Document',
      document_path: 'test/path',
      document_type: 'Test',
      association_type: 'test',
      association_id: 'test-id',
      file_size: 1000,
      file_type: 'application/pdf'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('document_associations')
      .insert(testRecord)
      .select()

    return NextResponse.json({
      success: true,
      tableExists: !error,
      testInsert: {
        success: !insertError,
        error: insertError ? {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        } : null,
        data: insertData
      }
    })

  } catch (error) {
    console.error('❌ Check table structure error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}