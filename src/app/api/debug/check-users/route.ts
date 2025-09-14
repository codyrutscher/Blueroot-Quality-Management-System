import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking users table...')
    
    // Try to query the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    // Also try a simple count query
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      usersTable: {
        exists: !usersError,
        error: usersError ? {
          message: usersError.message,
          code: usersError.code,
          details: usersError.details,
          hint: usersError.hint
        } : null,
        users: users || [],
        count: users?.length || 0
      },
      countQuery: {
        success: !countError,
        count: count || 0,
        error: countError ? {
          message: countError.message,
          code: countError.code
        } : null
      }
    })

  } catch (error) {
    console.error('❌ Check users error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}