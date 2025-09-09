import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { templateId, productId, productSku, title, assignedTo } = await request.json()
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Get template from Supabase to copy its structure
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('content')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      console.error('Template error:', templateError)
      // Create document without template reference
    }

    // Convert product SKU to product ID if SKU is provided
    let finalProductId = productId
    if (productSku && !productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('sku', productSku)
        .single()
      
      if (product) {
        finalProductId = product.id
      }
    }

    // Create document in Supabase with manual ID generation
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('Creating document with ID:', documentId, 'for user:', session.user.id)
    
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert([{
        id: documentId,
        title,
        filename: `${title}.json`,
        filepath: `/documents/${title.replace(/[^a-zA-Z0-9]/g, '_')}.json`,
        mimetype: 'application/json',
        size: JSON.stringify(template?.content || {}).length,
        content: JSON.stringify(template?.content || {}, null, 2),
        summary: null,
        status: 'EDIT_MODE',
        category: 'SPECIFICATION',
        tags: [],
        templateId: templateId || null,
        productId: finalProductId || null,
        workflowStatus: 'DRAFT',
        version: 1,
        isLatest: true,
        parentDocumentId: null,
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (docError) {
      console.error('Document creation error:', docError)
      return NextResponse.json(
        { error: 'Failed to create document: ' + docError.message },
        { status: 500 }
      )
    }

    console.log('Document created successfully:', document.id)
    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        user:users!documents_userId_fkey(name),
        product:products!documents_productId_fkey(productName, sku)
      `)
      .eq('userId', session.user.id)
      .order('updatedAt', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ documents: [] })
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ documents: [] })
  }
}