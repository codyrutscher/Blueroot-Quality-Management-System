#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')
const { Pinecone } = require('@pinecone-database/pinecone')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})
const index = pc.index(process.env.PINECONE_INDEX_NAME)

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1024,
  })
  return response.data[0].embedding
}

async function upsertVector(id, values, metadata) {
  await index.upsert([{
    id,
    values,
    metadata,
  }])
}

async function indexAllProducts() {
  console.log('🔍 Starting product indexing...')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }
  
  console.log(`Found ${products.length} products to index`)
  
  for (const product of products) {
    try {
      const searchableText = [
        product.productName,
        product.sku,
        product.brand,
        product.healthCategory,
        product.therapeuticPlatform,
        product.nutrientType,
        product.format,
        product.manufacturer,
        product.numberOfActives,
        product.bottleCount,
        `Unit count: ${product.unitCount}`,
        product.containsIron ? 'Contains Iron' : 'No Iron'
      ].filter(Boolean).join(' ')
      
      console.log(`Indexing product: ${product.productName}`)
      const embedding = await generateEmbedding(searchableText)
      
      await upsertVector(
        `product-${product.id}`,
        embedding,
        {
          type: 'product',
          productId: product.id,
          sku: product.sku,
          productName: product.productName,
          content: searchableText.substring(0, 1000)
        }
      )
      
      console.log(`✅ Indexed product: ${product.productName}`)
    } catch (error) {
      console.error(`❌ Error indexing product ${product.productName}:`, error.message)
    }
  }
  
  console.log('✅ Product indexing completed')
}

async function indexAllDocuments() {
  console.log('🔍 Starting document indexing...')
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select(`
      *,
      user:users!documents_userId_fkey(name),
      product:products(productName, sku, brand),
      template:templates(name, type)
    `)
    .in('status', ['READY', 'EDIT_MODE', 'SIGNED'])
  
  if (error) {
    console.error('Error fetching documents:', error)
    return
  }
  
  console.log(`Found ${documents.length} documents to index`)
  
  for (const document of documents) {
    try {
      let contentToIndex = ''
      
      if (document.content) {
        try {
          const parsedContent = JSON.parse(document.content)
          contentToIndex = extractTemplateContent(parsedContent)
        } catch {
          contentToIndex = document.content
        }
      }
      
      const searchableText = [
        document.title,
        document.filename,
        document.category,
        document.summary,
        document.product ? `Product: ${document.product.productName} ${document.product.sku} ${document.product.brand}` : '',
        document.template ? `Template: ${document.template.name} ${document.template.type}` : '',
        contentToIndex
      ].filter(Boolean).join(' ')
      
      console.log(`Indexing document: ${document.title}`)
      const embedding = await generateEmbedding(searchableText)
      
      await upsertVector(
        `document-${document.id}`,
        embedding,
        {
          type: 'document',
          documentId: document.id,
          title: document.title,
          filename: document.filename,
          content: contentToIndex.substring(0, 1000),
          category: document.category,
          userId: document.userId
        }
      )
      
      console.log(`✅ Indexed document: ${document.title}`)
    } catch (error) {
      console.error(`❌ Error indexing document ${document.title}:`, error.message)
    }
  }
  
  console.log('✅ Document indexing completed')
}

async function indexAllTemplates() {
  console.log('🔍 Starting template indexing...')
  
  const { data: templates, error } = await supabase
    .from('templates')
    .select(`
      *,
      creator:users!templates_createdBy_fkey(name)
    `)
    .eq('isActive', true)
  
  if (error) {
    console.error('Error fetching templates:', error)
    return
  }
  
  console.log(`Found ${templates.length} templates to index`)
  
  for (const template of templates) {
    try {
      const extractedText = extractTemplateContent(template.content)
      const searchableText = `${template.name} ${template.description || ''} ${template.type} ${extractedText}`
      
      console.log(`Indexing template: ${template.name}`)
      const embedding = await generateEmbedding(searchableText)
      
      await upsertVector(
        `template-${template.id}`,
        embedding,
        {
          type: 'template',
          templateId: template.id,
          name: template.name,
          content: extractedText.substring(0, 1000),
          creatorId: template.createdBy
        }
      )
      
      console.log(`✅ Indexed template: ${template.name}`)
    } catch (error) {
      console.error(`❌ Error indexing template ${template.name}:`, error.message)
    }
  }
  
  console.log('✅ Template indexing completed')
}

function extractTemplateContent(templateContent) {
  if (!templateContent) return ''
  
  try {
    let extractedText = ''
    
    if (typeof templateContent === 'string') {
      return templateContent
    }
    
    if (Array.isArray(templateContent)) {
      extractedText = templateContent.map(field => extractFieldText(field)).join(' ')
    } else if (typeof templateContent === 'object') {
      if (templateContent.fields) {
        extractedText = templateContent.fields.map(field => extractFieldText(field)).join(' ')
      } else if (templateContent.sections) {
        extractedText = templateContent.sections.map(section => {
          const sectionText = section.title || section.name || ''
          const fieldsText = section.fields ? section.fields.map(field => extractFieldText(field)).join(' ') : ''
          return `${sectionText} ${fieldsText}`
        }).join(' ')
      } else {
        extractedText = extractAllTextFromObject(templateContent)
      }
    }
    
    return extractedText.trim()
  } catch (error) {
    console.error('Error extracting template content:', error)
    return ''
  }
}

function extractFieldText(field) {
  if (!field) return ''
  
  let text = ''
  
  if (field.label) text += field.label + ' '
  if (field.name && field.name !== field.label) text += field.name + ' '
  if (field.placeholder) text += field.placeholder + ' '
  if (field.description) text += field.description + ' '
  
  if (field.value) {
    if (typeof field.value === 'string') {
      text += field.value + ' '
    } else if (Array.isArray(field.value)) {
      text += field.value.join(' ') + ' '
    }
  }
  
  if (field.options && Array.isArray(field.options)) {
    text += field.options.join(' ') + ' '
  }
  
  if (field.helpText) text += field.helpText + ' '
  if (field.instructions) text += field.instructions + ' '
  
  return text
}

function extractAllTextFromObject(obj) {
  let text = ''
  
  function traverse(item) {
    if (typeof item === 'string') {
      text += item + ' '
    } else if (typeof item === 'number') {
      text += item.toString() + ' '
    } else if (Array.isArray(item)) {
      item.forEach(traverse)
    } else if (item && typeof item === 'object') {
      Object.values(item).forEach(traverse)
    }
  }
  
  traverse(obj)
  return text
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive content indexing for Pinecone...')
    
    // Check current status
    const stats = await index.describeIndexStats()
    console.log('Current Pinecone status:', stats)
    
    // Index all content types
    await indexAllProducts()
    await indexAllTemplates()  
    await indexAllDocuments()
    
    // Check final status
    const finalStats = await index.describeIndexStats()
    console.log('Final Pinecone status:', finalStats)
    
    console.log('🎉 All content indexing completed successfully!')
    console.log(`Total vectors: ${finalStats.totalRecordCount}`)
  } catch (error) {
    console.error('❌ Error during indexing:', error)
    process.exit(1)
  }
}

main()