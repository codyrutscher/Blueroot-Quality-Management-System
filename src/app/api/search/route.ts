import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { generateEmbedding, generateChatResponse } from '@/lib/openai'
import { queryVectors } from '@/lib/pinecone'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, chatMode = false } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)
    
    // Search similar vectors in Pinecone for documents
    const documentMatches = await queryVectors(queryEmbedding, 5, { type: 'document' })
    
    // Search similar vectors in Pinecone for templates
    const templateMatches = await queryVectors(queryEmbedding, 5, { type: 'template' })
    
    // Search similar vectors in Pinecone for products
    const productMatches = await queryVectors(queryEmbedding, 5, { type: 'product' })
    
    // Combine all vector matches
    const allMatches = [
      ...documentMatches.map(m => ({ ...m, searchType: 'vector-document' })),
      ...templateMatches.map(m => ({ ...m, searchType: 'vector-template' })),
      ...productMatches.map(m => ({ ...m, searchType: 'vector-product' }))
    ].sort((a, b) => (b.score || 0) - (a.score || 0))
    
    // Get document details from PostgreSQL for vector matches
    const documentIds = documentMatches.map(match => match.metadata?.documentId).filter(Boolean)
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        status: { in: ['READY', 'EDIT_MODE', 'SIGNED'] },
      },
      include: { user: true },
    })

    // Search products by name, SKU, or any field containing the query
    let products = []
    try {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { productName: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { healthCategory: { contains: query, mode: 'insensitive' } },
            { therapeuticPlatform: { contains: query, mode: 'insensitive' } },
            { nutrientType: { contains: query, mode: 'insensitive' } },
            { format: { contains: query, mode: 'insensitive' } },
            { manufacturer: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      })
    } catch (error) {
      console.log('Product search not available, skipping product results')
      products = []
    }

    // Search templates by name, description, or content
    let templates = []
    try {
      templates = await prisma.template.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { type: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: { creator: true },
        take: 10
      })
    } catch (error) {
      console.log('Template search error:', error)
      templates = []
    }

    // Search through form documents and their content
    let formDocuments = []
    try {
      formDocuments = await prisma.document.findMany({
        where: {
          AND: [
            { status: { in: ['READY', 'EDIT_MODE', 'SIGNED'] } },
            {
              OR: [
                { category: 'FORM' },
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                { summary: { contains: query, mode: 'insensitive' } },
                { filename: { contains: query, mode: 'insensitive' } },
                { tags: { has: query } }
              ]
            }
          ]
        },
        include: { user: true, product: true, template: true },
        take: 15
      })
    } catch (error) {
      console.log('Form document search error:', error)
      formDocuments = []
    }

    // Prepare search results from vector matches
    const vectorDocumentResults = documentMatches.map(match => {
      const document = documents.find(doc => doc.id === match.metadata?.documentId)
      return {
        type: 'document' as const,
        document,
        score: match.score || 0,
        relevantChunk: match.metadata?.content,
      }
    }).filter(result => result.document)

    // Get templates and products from vector matches
    const vectorTemplateIds = templateMatches.map(m => m.metadata?.templateId).filter(Boolean)
    const vectorProductIds = productMatches.map(m => m.metadata?.productId).filter(Boolean)

    const vectorTemplates = vectorTemplateIds.length > 0 ? await prisma.template.findMany({
      where: { id: { in: vectorTemplateIds }, isActive: true },
      include: { creator: true }
    }) : []

    const vectorProducts = vectorProductIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: vectorProductIds } }
    }) : []

    const vectorTemplateResults = templateMatches.map(match => {
      const template = vectorTemplates.find(t => t.id === match.metadata?.templateId)
      return template ? {
        type: 'template' as const,
        template,
        score: match.score || 0,
        relevantChunk: match.metadata?.content || `${template.name} - ${template.type}`,
      } : null
    }).filter(Boolean)

    const vectorProductResults = productMatches.map(match => {
      const product = vectorProducts.find(p => p.id === match.metadata?.productId)
      return product ? {
        type: 'product' as const,
        product,
        score: match.score || 0,
        relevantChunk: match.metadata?.content || `${product.productName} - ${product.sku}`,
      } : null
    }).filter(Boolean)

    // Prepare product results
    const productResults = products.map(product => ({
      type: 'product',
      product,
      score: 0.8,
      relevantChunk: `${product.productName} - ${product.sku} - ${product.brand}`
    }))

    // Prepare template results
    const templateResults = templates.map(template => ({
      type: 'template',
      template,
      score: 0.7,
      relevantChunk: `${template.name} - ${template.type} - ${template.description || 'No description'}`
    }))

    // Prepare form document results (separate from regular document vector search)
    const formDocumentResults = formDocuments
      .filter(doc => !documentResults.some(dr => dr.document?.id === doc.id)) // Avoid duplicates
      .map(document => ({
        type: 'document',
        document,
        score: 0.6,
        relevantChunk: document.summary || document.content?.substring(0, 200) + '...' || 'Form document'
      }))

    // Combine all results, prioritizing vector search results
    const results = [
      ...vectorDocumentResults,
      ...vectorTemplateResults, 
      ...vectorProductResults,
      ...productResults.filter(p => !vectorProductResults.some(vp => vp.product?.id === p.product.id)),
      ...templateResults.filter(t => !vectorTemplateResults.some(vt => vt.template?.id === t.template.id)),
      ...formDocumentResults.filter(fd => !vectorDocumentResults.some(vd => vd.document?.id === fd.document.id))
    ].sort((a, b) => (b.score || 0) - (a.score || 0))

    // If chat mode, generate AI response
    let aiResponse = ''
    if (chatMode && results.length > 0) {
      const context = results
        .map(r => {
          if (r.type === 'product') {
            const product = r.product
            return `PRODUCT: ${product.productName}
SKU: ${product.sku}
Brand: ${product.brand}
Health Category: ${product.healthCategory || 'N/A'}
Therapeutic Platform: ${product.therapeuticPlatform || 'N/A'}
Nutrient Type: ${product.nutrientType || 'N/A'}
Format: ${product.format || 'N/A'}
Number of Actives: ${product.numberOfActives || 'N/A'}
Bottle Count: ${product.bottleCount || 'N/A'}
Unit Count: ${product.unitCount || 0}
Manufacturer: ${product.manufacturer || 'N/A'}
Contains Iron: ${product.containsIron ? 'Yes' : 'No'}`
          } else if (r.type === 'template') {
            const template = r.template
            return `TEMPLATE: ${template.name}
Type: ${template.type}
Description: ${template.description || 'No description'}
Created by: ${template.creator.name}
Template Content: ${r.relevantChunk || 'Template structure available'}`
          } else {
            const doc = r.document
            return `DOCUMENT: ${doc?.title}
Filename: ${doc?.filename}
Category: ${doc?.category}
Status: ${doc?.status || 'Unknown'}
Workflow Status: ${doc?.workflowStatus || 'Unknown'}
Created by: ${doc?.user?.name || 'Unknown'}
${doc?.product ? `Associated Product: ${doc.product.productName} (${doc.product.sku})` : ''}
${doc?.template ? `Based on Template: ${doc.template.name} (${doc.template.type})` : ''}
Content: ${r.relevantChunk || 'Content not available'}`
          }
        })
        .join('\n\n---\n\n')
      
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an expert AI assistant for a manufacturing and quality management system. You have access to comprehensive product data, manufacturing documents, quality procedures, specifications, and form templates. Use the provided context to answer questions about products, their specifications, safety requirements, manufacturing processes, quality procedures, compliance documentation, and any other company information. Be specific and detailed in your responses, referencing specific products, documents, or procedures when relevant.',
        },
        {
          role: 'user' as const,
          content: `Context:\n${context}\n\nQuestion: ${query}`,
        },
      ]
      
      aiResponse = await generateChatResponse(messages)
    }

    // Save search history
    await prisma.searchHistory.create({
      data: {
        query,
        results: { matches: results.length, chatMode, aiResponse },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      results,
      aiResponse,
      totalResults: results.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}