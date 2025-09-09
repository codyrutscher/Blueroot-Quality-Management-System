import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export const pineconeIndex = pc.index(process.env.PINECONE_INDEX_NAME!)

export async function upsertVector(id: string, values: number[], metadata: any) {
  await pineconeIndex.upsert([{
    id,
    values,
    metadata,
  }])
}

export async function queryVectors(vector: number[], topK: number = 5, filter?: any) {
  const queryResponse = await pineconeIndex.query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  })
  
  return queryResponse.matches || []
}