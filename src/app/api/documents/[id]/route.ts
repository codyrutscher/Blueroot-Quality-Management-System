import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get document from Supabase
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        user:users!documents_userId_fkey(name),
        product:products!documents_productId_fkey(productName, sku),
        template:templates!documents_templateId_fkey(name, type)
      `)
      .eq('id', id)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updateData = await request.json()

    // Update document in Supabase
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        content: JSON.stringify(updateData.content),
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the document or has permission to delete
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('userId')
      .eq('id', params.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Only allow document owner to delete (you can modify this logic for admin permissions)
    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Delete related records first (due to foreign key constraints)
    // Delete approvals
    await supabase
      .from('approvals')
      .delete()
      .eq('documentId', params.id)

    // Delete document shares
    await supabase
      .from('document_shares')
      .delete()
      .eq('documentId', params.id)

    // Delete document embeddings
    await supabase
      .from('document_embeddings')
      .delete()
      .eq('documentId', params.id)

    // Finally delete the document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting document:', deleteError)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}