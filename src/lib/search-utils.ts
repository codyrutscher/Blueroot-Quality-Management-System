import { prisma } from './prisma'
import { generateEmbedding } from './openai'
import { upsertVector } from './pinecone'

interface TemplateField {
  id: string
  label: string
  type: string
  value?: string
  options?: string[]
  required?: boolean
  section?: string
}

export function extractTemplateContent(templateContent: any): string {
  if (!templateContent) return ''
  
  try {
    let extractedText = ''
    
    // Handle different template content structures
    if (typeof templateContent === 'string') {
      return templateContent
    }
    
    if (Array.isArray(templateContent)) {
      extractedText = templateContent.map(field => extractFieldText(field)).join(' ')
    } else if (typeof templateContent === 'object') {
      // Handle nested object structure
      if (templateContent.fields) {
        extractedText = templateContent.fields.map((field: any) => extractFieldText(field)).join(' ')
      } else if (templateContent.sections) {
        extractedText = templateContent.sections.map((section: any) => {
          const sectionText = section.title || section.name || ''
          const fieldsText = section.fields ? section.fields.map((field: any) => extractFieldText(field)).join(' ') : ''
          return `${sectionText} ${fieldsText}`
        }).join(' ')
      } else {
        // Extract all string values from the object
        extractedText = extractAllTextFromObject(templateContent)
      }
    }
    
    return extractedText.trim()
  } catch (error) {
    console.error('Error extracting template content:', error)
    return ''
  }
}

function extractFieldText(field: any): string {
  if (!field) return ''
  
  let text = ''
  
  // Add field label/name
  if (field.label) text += field.label + ' '
  if (field.name && field.name !== field.label) text += field.name + ' '
  if (field.placeholder) text += field.placeholder + ' '
  if (field.description) text += field.description + ' '
  
  // Add field value if it exists
  if (field.value) {
    if (typeof field.value === 'string') {
      text += field.value + ' '
    } else if (Array.isArray(field.value)) {
      text += field.value.join(' ') + ' '
    }
  }
  
  // Add options for select/radio fields
  if (field.options && Array.isArray(field.options)) {
    text += field.options.join(' ') + ' '
  }
  
  // Add help text or instructions
  if (field.helpText) text += field.helpText + ' '
  if (field.instructions) text += field.instructions + ' '
  
  return text
}

function extractAllTextFromObject(obj: any): string {
  let text = ''
  
  function traverse(item: any) {
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

export function extractFormFieldsContent(document: any): string {
  if (!document.content) return ''
  
  try {
    // Try to parse as JSON in case it contains structured form data
    const parsedContent = JSON.parse(document.content)
    return extractTemplateContent(parsedContent)
  } catch {
    // If it's not JSON, return the raw content
    return document.content
  }
}

export async function indexTemplateContent(templateId: string) {
  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { creator: true }
    })
    
    if (!template) return
    
    const extractedText = extractTemplateContent(template.content)
    const searchableText = `${template.name} ${template.description || ''} ${template.type} ${extractedText}`
    
    const embedding = await generateEmbedding(searchableText)
    
    await upsertVector(
      `template-${template.id}`,
      embedding,
      {
        type: 'template',
        templateId: template.id,
        name: template.name,
        content: extractedText.substring(0, 1000), // Limit content length
        creatorId: template.createdBy
      }
    )
    
    console.log(`Indexed template: ${template.name}`)
  } catch (error) {
    console.error(`Error indexing template ${templateId}:`, error)
  }
}

export async function indexAllTemplates() {
  try {
    const templates = await prisma.template.findMany({
      where: { isActive: true },
      select: { id: true }
    })
    
    console.log(`Indexing ${templates.length} templates...`)
    
    for (const template of templates) {
      await indexTemplateContent(template.id)
    }
    
    console.log('Template indexing completed')
  } catch (error) {
    console.error('Error indexing templates:', error)
  }
}

export function extractProductSearchableText(product: any): string {
  const fields = [
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
  ]
  
  return fields.filter(Boolean).join(' ')
}

export async function indexProductContent(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) return
    
    const searchableText = extractProductSearchableText(product)
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
    
    console.log(`Indexed product: ${product.productName}`)
  } catch (error) {
    console.error(`Error indexing product ${productId}:`, error)
  }
}

export async function indexAllProducts() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true }
    })
    
    console.log(`Indexing ${products.length} products...`)
    
    for (const product of products) {
      await indexProductContent(product.id)
    }
    
    console.log('Product indexing completed')
  } catch (error) {
    console.error('Error indexing products:', error)
  }
}