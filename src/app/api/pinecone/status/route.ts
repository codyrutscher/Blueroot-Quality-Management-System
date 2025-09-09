import { NextRequest, NextResponse } from 'next/server'
import { pineconeIndex } from '@/lib/pinecone'

export async function GET() {
  try {
    // Get index stats to see if there's any data
    const stats = await pineconeIndex.describeIndexStats()
    
    return NextResponse.json({
      indexName: process.env.PINECONE_INDEX_NAME,
      stats: stats,
      totalVectors: stats.totalRecordCount || 0,
      namespaces: stats.namespaces || {}
    })
  } catch (error) {
    console.error('Error checking Pinecone status:', error)
    return NextResponse.json({ 
      error: 'Failed to check Pinecone status',
      details: error.message 
    }, { status: 500 })
  }
}