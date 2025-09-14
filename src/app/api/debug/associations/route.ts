import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Listing all association files...')
    
    const { data: files, error } = await supabase.storage
      .from('documents')
      .list('associations')

    if (error) {
      console.error('Error listing association files:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('📁 Found association files:', files?.length || 0)
    
    return NextResponse.json({
      success: true,
      files: files || [],
      count: files?.length || 0
    })

  } catch (error) {
    console.error('Debug associations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}