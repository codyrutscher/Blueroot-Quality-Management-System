import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params

    // Get product from Supabase
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get documents associated with this product
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        *,
        user:users!documents_userId_fkey(name),
        template:templates!documents_templateId_fkey(name, type),
        approvals(
          status,
          comments,
          approvedAt,
          approver:users!approvals_approverId_fkey(name)
        )
      `)
      .eq('productId', product.id)
      .order('updatedAt', { ascending: false })

    if (docsError) {
      console.error('Error fetching product documents:', docsError)
    }

    // Process documents to extract digital signatures from approvals
    const processedDocuments = documents?.map(doc => {
      // Find the most recent approved approval
      const approvedApproval = doc.approvals?.find(approval => 
        approval.status === 'APPROVED' && approval.comments
      )
      
      // Extract digital signature from comments if present
      let digitalSignature = null
      if (approvedApproval?.comments) {
        const signatureMatch = approvedApproval.comments.match(/Digitally signed by:\s*(.+?)(?:\n|$)/)
        if (signatureMatch) {
          digitalSignature = signatureMatch[1].trim()
        }
      }
      
      return {
        ...doc,
        digitalSignature,
        approvedAt: approvedApproval?.approvedAt || null
      }
    }) || []

    // Add documents to product
    product.documents = processedDocuments

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sku } = await params
    const updateData = await request.json()

    // Update product in Supabase
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('sku', sku)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}