#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const OpenAI = require('openai')
const { Pinecone } = require('@pinecone-database/pinecone')

const prisma = new PrismaClient()
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

async function indexAllTemplates() {
  console.log('🔍 Starting template indexing...')
  
  const templates = await prisma.template.findMany({
    where: { isActive: true },
    include: { creator: true }
  })
  
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

async function indexAllProducts() {
  console.log('🔍 Starting product indexing...')
  
  const products = await prisma.product.findMany()
  
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
        product.bottleCount
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
          content: searchableText
        }
      )
      
      console.log(`✅ Indexed product: ${product.productName}`)
    } catch (error) {
      console.error(`❌ Error indexing product ${product.productName}:`, error.message)
    }
  }
  
  console.log('✅ Product indexing completed')
}

async function indexExistingDocuments() {
  console.log('🔍 Starting document re-indexing...')
  
  const documents = await prisma.document.findMany({
    where: { 
      status: 'READY',
      content: { not: null }
    },
    include: { user: true }
  })
  
  console.log(`Found ${documents.length} documents to re-index`)
  
  for (const document of documents) {
    try {
      let contentToIndex = ''
      
      // Extract content based on document type
      if (document.content) {
        try {
          // Try to parse as JSON in case it's structured form data
          const parsedContent = JSON.parse(document.content)
          contentToIndex = extractTemplateContent(parsedContent)
        } catch {
          // If not JSON, use raw content
          contentToIndex = document.content
        }
      }
      
      const searchableText = `${document.title} ${document.filename} ${contentToIndex} ${document.summary || ''}`
      
      console.log(`Re-indexing document: ${document.title}`)
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
      
      console.log(`✅ Re-indexed document: ${document.title}`)
    } catch (error) {
      console.error(`❌ Error re-indexing document ${document.title}:`, error.message)
    }
  }
  
  console.log('✅ Document re-indexing completed')
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive content indexing...')
    console.log('This will index all templates, products, and existing documents for search.')
    
    await indexAllTemplates()
    await indexAllProducts()
    await indexExistingDocuments()
    
    console.log('🎉 All content indexing completed successfully!')
  } catch (error) {
    console.error('❌ Error during indexing:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  indexAllTemplates,
  indexAllProducts,
  indexExistingDocuments
}