require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

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

async function addProductData() {
  console.log('🚀 Adding sample product data to Pinecone...');
  
  // Sample products based on your CSV data
  const products = [
    {
      id: 'product-iron-plus',
      text: 'Iron Plus Fairhaven Health prenatal vitamin iron deficiency anemia supplement contains iron folic acid vitamin D pregnancy health',
      metadata: {
        type: 'product',
        productName: 'Iron Plus',
        sku: 'FH-IRON-001',
        brand: 'Fairhaven Health',
        content: 'Prenatal vitamin with iron for pregnancy, helps with iron deficiency and anemia'
      }
    },
    {
      id: 'product-omega3',
      text: 'Omega-3 DHA EPA fish oil supplement Fairhaven Health pregnancy brain development heart health',
      metadata: {
        type: 'product', 
        productName: 'Omega-3 DHA',
        sku: 'FH-OMEGA-001',
        brand: 'Fairhaven Health',
        content: 'Fish oil supplement with DHA and EPA for pregnancy and brain development'
      }
    },
    {
      id: 'product-prenatal',
      text: 'Prenatal multivitamin Fairhaven Health pregnancy vitamins folic acid iron calcium vitamin D',
      metadata: {
        type: 'product',
        productName: 'Prenatal Multivitamin',
        sku: 'FH-PRENATAL-001', 
        brand: 'Fairhaven Health',
        content: 'Complete prenatal multivitamin with essential nutrients for pregnancy'
      }
    }
  ];
  
  // Sample documents
  const documents = [
    {
      id: 'document-coa-iron',
      text: 'Certificate of Analysis COA Iron Plus quality testing safety requirements batch testing manufacturing standards microbial testing heavy metals',
      metadata: {
        type: 'document',
        documentId: 'coa-iron-001',
        title: 'Certificate of Analysis - Iron Plus',
        content: 'Quality testing results including microbial testing, heavy metals analysis, and safety requirements for Iron Plus'
      }
    },
    {
      id: 'document-spec-omega',
      text: 'Product Specification Omega-3 DHA manufacturing process quality control testing procedures safety requirements',
      metadata: {
        type: 'document',
        documentId: 'spec-omega-001', 
        title: 'Product Specification - Omega-3',
        content: 'Manufacturing process and quality control procedures for Omega-3 DHA supplement'
      }
    }
  ];
  
  // Add all data
  for (const product of products) {
    try {
      console.log(`Adding product: ${product.metadata.productName}`);
      const embedding = await generateEmbedding(product.text);
      
      await index.upsert([{
        id: product.id,
        values: embedding,
        metadata: product.metadata
      }]);
      
      console.log(`✅ Added: ${product.metadata.productName}`);
    } catch (error) {
      console.error(`❌ Error adding ${product.metadata.productName}:`, error.message);
    }
  }
  
  for (const document of documents) {
    try {
      console.log(`Adding document: ${document.metadata.title}`);
      const embedding = await generateEmbedding(document.text);
      
      await index.upsert([{
        id: document.id,
        values: embedding,
        metadata: document.metadata
      }]);
      
      console.log(`✅ Added: ${document.metadata.title}`);
    } catch (error) {
      console.error(`❌ Error adding ${document.metadata.title}:`, error.message);
    }
  }
  
  // Check final status
  console.log('🔍 Checking final Pinecone status...');
  const stats = await index.describeIndexStats();
  console.log('Final stats:', stats);
  console.log(`🎉 Total vectors in database: ${stats.totalRecordCount}`);
}

addProductData().catch(console.error);