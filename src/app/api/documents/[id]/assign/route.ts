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

    const body = await request.json()
    const { assignedUsers, productSku, assignedTo, comments, productId } = body

    // Handle multiple assignedUsers (from new assignment flow)
    if (assignedUsers && Array.isArray(assignedUsers) && assignedUsers.length > 0) {
      try {
        // First, clear existing shares for this document
        await supabase
          .from('document_shares')
          .delete()
          .eq('documentId', id)

        // Get user IDs by names
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name')
          .in('name', assignedUsers)

        if (usersError) {
          console.error('Error finding users:', usersError)
          return NextResponse.json({ error: 'Could not find some users' }, { status: 400 })
        }

        console.log('Found users for assignment:', users)
        console.log('Looking for users with names:', assignedUsers)

        // Create document shares for each assigned user
        const shares = users.map((user, index) => ({
          id: `share_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
          documentId: id,
          sharedWith: user.id,
          sharedBy: session.user.id,
          permissions: 'edit',
          createdAt: new Date().toISOString()
        }))

        console.log('Creating shares:', shares)

        const { error: sharesError } = await supabase
          .from('document_shares')
          .insert(shares)

        if (sharesError) {
          console.error('Error creating document shares:', sharesError)
          return NextResponse.json({ 
            error: 'Failed to assign users', 
            details: sharesError.message,
            code: sharesError.code 
          }, { status: 500 })
        }

        console.log('Document shares created successfully')

        // Update document with product if provided
        if (productSku) {
          const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('sku', productSku)
            .single()

          if (product) {
            await supabase
              .from('documents')
              .update({ productId: product.id })
              .eq('id', id)
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: `Document assigned to ${assignedUsers.join(', ')}` 
        })
      } catch (error) {
        console.error('Error in assignment process:', error)
        return NextResponse.json({ error: 'Assignment failed' }, { status: 500 })
      }
    }

    // Handle legacy single assignment (for backwards compatibility)
    if (productId) {
      // Assign document to product
      const { error } = await supabase
        .from('documents')
        .update({ productId })
        .eq('id', id)

      if (error) {
        console.error('Error assigning to product:', error)
        return NextResponse.json({ error: 'Failed to assign to product' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Document assigned to product successfully` 
      })
    } else if (assignedTo) {
      // Single user assignment for approval
      const { error: updateError } = await supabase
        .from('documents')
        .update({ workflowStatus: 'IN_REVIEW' })
        .eq('id', id)

      if (updateError) {
        console.error('Error updating document status:', updateError)
        return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
      }

      // Create approval record
      const { error: approvalError } = await supabase
        .from('approvals')
        .insert({
          documentId: id,
          approverId: assignedTo,
          status: 'PENDING',
          comments,
          createdAt: new Date().toISOString()
        })

      if (approvalError) {
        console.error('Error creating approval:', approvalError)
        return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Document assigned for approval` 
      })
    } else {
      return NextResponse.json(
        { error: 'Assignment data is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error assigning document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}