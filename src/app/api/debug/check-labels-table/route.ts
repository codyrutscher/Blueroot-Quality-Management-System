import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking labels table...')
    
    // Try to query the labels table
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('*')
      .limit(1)

    // Also check destination associations for labels
    const { data: labelAssociations, error: assocError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'destination')
      .eq('association_id', 'labels')

    return NextResponse.json({
      success: true,
      labelsTable: {
        exists: !labelsError,
        error: labelsError ? {
          message: labelsError.message,
          code: labelsError.code,
          details: labelsError.details
        } : null,
        sampleData: labels || []
      },
      labelAssociations: {
        exists: !assocError,
        error: assocError ? {
          message: assocError.message,
          code: assocError.code,
          details: assocError.details
        } : null,
        count: labelAssociations?.length || 0,
        data: labelAssociations || []
      }
    })

  } catch (error) {
    console.error('❌ Check labels table error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}