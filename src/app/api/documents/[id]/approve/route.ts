import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, comments, signature, timestamp } = await request.json()

    // Update specific document in Supabase
    const updates: any = {
      updatedAt: new Date().toISOString()
    }

    if (action === 'approve') {
      updates.workflowStatus = 'APPROVED'  // Use APPROVED not COMPLETED
      updates.status = 'SIGNED'
      // digitalSignature will be stored in approvals table
    } else if (action === 'reject') {
      updates.workflowStatus = 'REJECTED'
      updates.status = 'EDIT_MODE'
    }

    // Update the specific document
    const { data: document, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return NextResponse.json({ error: 'Failed to update document: ' + error.message }, { status: 500 })
    }

    // Create approval record
    if (action === 'approve' || action === 'reject') {
      // For approvals, combine digital signature with comments
      let finalComments = comments || ''
      if (action === 'approve' && signature) {
        finalComments = finalComments 
          ? `${comments}\n\nDigitally signed by: ${signature}`
          : `Digitally signed by: ${signature}`
      }

      const approvalData = {
        documentId: id,
        approverId: session.user.id,
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        comments: finalComments,
        approvedAt: action === 'approve' ? new Date(timestamp).toISOString() : null
      }

      const { error: approvalError } = await supabase
        .from('approvals')
        .insert(approvalData)

      if (approvalError) {
        console.error('Error creating approval record:', approvalError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      document,
      message: action === 'approve' 
        ? 'Document approved and digitally signed' 
        : 'Document rejected'
    })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}