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

async function testSearch() {
  try {
    console.log('🔍 Testing search functionality...');
    
    // First, check what's in the database
    const stats = await index.describeIndexStats();
    console.log('Current Pinecone stats:', stats);
    
    // Try to query for "Iron Plus"
    const query = "Iron Plus prenatal vitamin";
    console.log(`Searching for: "${query}"`);
    
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1024,
    });
    
    const queryResponse = await index.query({
      vector: embedding.data[0].embedding,
      topK: 5,
      includeMetadata: true
    });
    
    console.log('Search results:');
    console.log(`Found ${queryResponse.matches?.length || 0} matches`);
    
    if (queryResponse.matches) {
      queryResponse.matches.forEach((match, i) => {
        console.log(`${i + 1}. Score: ${match.score}, ID: ${match.id}`);
        console.log('   Metadata:', match.metadata);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
  }
}

testSearch();