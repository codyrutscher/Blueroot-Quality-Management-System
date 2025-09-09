import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log('Documents GET: Session:', session)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching ALL documents for user:', session.user.id)
    
    // Get ALL documents for all users (simplified sharing)
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        user:users!documents_userId_fkey(name, email),
        product:products(productName, sku, brand),
        template:templates(name, type),
        shares:document_shares(
          sharedUser:users!document_shares_sharedWith_fkey(name, email)
        ),
        approvals(
          status,
          comments,
          approvedAt,
          approver:users!approvals_approverId_fkey(name)
        )
      `)
      .order('updatedAt', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('Found total documents:', documents?.length || 0)
    
    // Debug: Log the first document's shares if any
    if (documents && documents.length > 0) {
      console.log('First document shares:', JSON.stringify(documents[0].shares, null, 2))
    }
    
    return NextResponse.json({ documents: documents || [] })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}