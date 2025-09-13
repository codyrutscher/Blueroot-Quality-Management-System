import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const storagePath = searchParams.get('path')
    
    if (!documentId && !storagePath) {
      return NextResponse.json({ error: 'Document ID or storage path is required' }, { status: 400 })
    }

    let finalStoragePath = storagePath

    // If document ID is provided, get the storage path from database
    if (documentId && !storagePath) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('storage_path, filename')
        .eq('id', documentId)
        .single()

      if (docError || !document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      finalStoragePath = document.storage_path
    }

    if (!finalStoragePath) {
      return NextResponse.json({ error: 'Storage path not found' }, { status: 404 })
    }

    // Get the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(finalStoragePath)

    if (downloadError) {
      console.error('Error downloading from Supabase:', downloadError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Extract filename from storage path
    const filename = finalStoragePath.split('/').pop() || 'document'

    // Determine content type
    let contentType = 'application/octet-stream'
    if (filename.endsWith('.pdf')) {
      contentType = 'application/pdf'
    } else if (filename.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } else if (filename.endsWith('.txt')) {
      contentType = 'text/plain'
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}