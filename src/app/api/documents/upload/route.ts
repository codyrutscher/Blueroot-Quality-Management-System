import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { extractTextFromFile, processDocumentEmbeddings } from '@/utils/document-processor'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file to uploads directory
    const filename = `${Date.now()}-${file.name}`
    const filepath = join(process.cwd(), 'uploads', filename)
    await writeFile(filepath, buffer)

    // Extract text content
    let content = ''
    try {
      content = await extractTextFromFile(buffer, file.type)
    } catch (error) {
      console.error('Error extracting text:', error)
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        title: file.name,
        filename,
        filepath,
        mimetype: file.type,
        size: file.size,
        content,
        userId: session.user.id,
        status: 'PROCESSING',
      },
    })

    // Process embeddings in background
    if (content) {
      processDocumentEmbeddings(document.id, content)
        .then(async () => {
          await prisma.document.update({
            where: { id: document.id },
            data: { status: 'EDIT_MODE' }, // Changed from 'READY' to 'EDIT_MODE'
          })
        })
        .catch(async (error) => {
          console.error('Error processing embeddings:', error)
          await prisma.document.update({
            where: { id: document.id },
            data: { status: 'ERROR' },
          })
        })
    }

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}