import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Templates API: Request received')
    const session = await getServerSession(authOptions)
    console.log('Templates API: Session:', session)
    
    if (!session?.user?.id) {
      console.log('Templates API: No user ID in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Templates API: Fetching templates from Supabase')
    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        *,
        creator:users!templates_createdBy_fkey(name)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Templates API: Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('Templates API: Found templates:', templates?.length || 0)
    return NextResponse.json({ templates: templates || [] })
  } catch (error) {
    console.error('Templates API: Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, type, content } = await request.json()
    
    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }

    const template = await prisma.template.create({
      data: {
        name,
        description,
        type: type || 'FINISHED_PRODUCT_SPEC',
        content,
        createdBy: session.user.id,
      },
      include: { creator: { select: { name: true } } },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}