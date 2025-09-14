import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Fetching users for task assignment...')

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, full_name')
      .order('full_name')

    if (error) {
      console.error('❌ Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    console.log('👥 Found users:', users?.length || 0)

    return NextResponse.json({ 
      users: users || [],
      count: users?.length || 0
    })

  } catch (error) {
    console.error('❌ Users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}