import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking document associations in database...')
    
    // Get all associations
    const { data: associations, error } = await supabase
      .from('document_associations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching associations:', error)
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 })
    }

    console.log('📄 Found associations:', associations?.length || 0)

    return NextResponse.json({
      success: true,
      associations: associations || [],
      count: associations?.length || 0
    })

  } catch (error) {
    console.error('❌ Check associations error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}