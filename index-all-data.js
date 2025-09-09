require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX_NAME);

async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1024,
  });
  return response.data[0].embedding;
}

async function indexAllRealData() {
  console.log('🚀 Starting to index ALL your real data...');
  
  let totalIndexed = 0;
  
  try {
    // 1. Index ALL products
    console.log('📦 Fetching all products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log(`Found ${products.length} products to index`);
      
      for (const product of products) {
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
          `Units: ${product.unitCount}`,
          product.containsIron ? 'Contains Iron' : ''
        ].filter(Boolean).join(' ');
        
        const embedding = await generateEmbedding(searchableText);
        
        await index.upsert([{
          id: `product-${product.id}`,
          values: embedding,
          metadata: {
            type: 'product',
            productId: product.id,
            sku: product.sku,
            productName: product.productName,
            content: searchableText
          }
        }]);
        
        totalIndexed++;
        if (totalIndexed % 10 === 0) {
          console.log(`✅ Indexed ${totalIndexed} items so far...`);
        }
      }
      
      console.log(`✅ Indexed ${products.length} products`);
    }
    
    // 2. Index ALL documents
    console.log('📄 Fetching all documents...');
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        *,
        user:users!documents_userId_fkey(name),
        product:products(productName, sku, brand),
        template:templates(name, type)
      `);
    
    if (docsError) {
      console.error('Documents error:', docsError);
    } else {
      console.log(`Found ${documents.length} documents to index`);
      
      for (const doc of documents) {
        const searchableText = [
          doc.title,
          doc.filename,
          doc.category,
          doc.summary,
          doc.content ? doc.content.substring(0, 2000) : '',
          doc.product ? `Product: ${doc.product.productName} ${doc.product.sku}` : '',
          doc.template ? `Template: ${doc.template.name}` : ''
        ].filter(Boolean).join(' ');
        
        const embedding = await generateEmbedding(searchableText);
        
        await index.upsert([{
          id: `document-${doc.id}`,
          values: embedding,
          metadata: {
            type: 'document',
            documentId: doc.id,
            title: doc.title,
            content: searchableText.substring(0, 1000)
          }
        }]);
        
        totalIndexed++;
        if (totalIndexed % 10 === 0) {
          console.log(`✅ Indexed ${totalIndexed} items so far...`);
        }
      }
      
      console.log(`✅ Indexed ${documents.length} documents`);
    }
    
    // 3. Index ALL templates
    console.log('📋 Fetching all templates...');
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('isActive', true);
    
    if (templatesError) {
      console.error('Templates error:', templatesError);
    } else {
      console.log(`Found ${templates.length} templates to index`);
      
      for (const template of templates) {
        const searchableText = [
          template.name,
          template.description,
          template.type,
          JSON.stringify(template.content).substring(0, 2000)
        ].filter(Boolean).join(' ');
        
        const embedding = await generateEmbedding(searchableText);
        
        await index.upsert([{
          id: `template-${template.id}`,
          values: embedding,
          metadata: {
            type: 'template',
            templateId: template.id,
            name: template.name,
            content: searchableText.substring(0, 1000)
          }
        }]);
        
        totalIndexed++;
      }
      
      console.log(`✅ Indexed ${templates.length} templates`);
    }
    
    console.log(`🎉 COMPLETE! Indexed ${totalIndexed} total items`);
    
    // Final status check
    const finalStats = await index.describeIndexStats();
    console.log('Final Pinecone stats:', finalStats);
    
  } catch (error) {
    console.error('❌ Error during indexing:', error);
  }
}

indexAllRealData();