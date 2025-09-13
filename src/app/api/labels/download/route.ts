import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storagePath = searchParams.get('path')
    
    if (!storagePath) {
      return NextResponse.json({ error: 'Storage path is required' }, { status: 400 })
    }

    // Get the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath)

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
    const filename = storagePath.split('/').pop() || 'label.pdf'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error downloading label:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}