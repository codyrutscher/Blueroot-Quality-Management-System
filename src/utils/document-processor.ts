import * as pdf from 'pdf-parse'
import * as mammoth from 'mammoth'
import { generateEmbedding } from '@/lib/openai'
import { upsertVector } from '@/lib/pinecone'
import { prisma } from '@/lib/prisma'

export async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  switch (mimetype) {
    case 'application/pdf':
      const pdfData = await pdf(buffer)
      return pdfData.text
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const docxData = await mammoth.extractRawText({ buffer })
      return docxData.value
    case 'text/plain':
      return buffer.toString('utf-8')
    default:
      throw new Error(`Unsupported file type: ${mimetype}`)
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start = end - overlap
    
    if (start >= text.length) break
  }
  
  return chunks
}

export async function processDocumentEmbeddings(documentId: string, text: string) {
  const chunks = chunkText(text)
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await generateEmbedding(chunk)
    const vectorId = `${documentId}_${i}`
    
    // Store in Pinecone
    await upsertVector(vectorId, embedding, {
      documentId,
      chunkIndex: i,
      content: chunk,
    })
    
    // Store in PostgreSQL
    await prisma.documentEmbedding.create({
      data: {
        documentId,
        chunkIndex: i,
        content: chunk,
        vectorId,
      },
    })
  }
}