import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📅 Fetching shelf life documents...')
    
    // Get all documents uploaded to shelf life destination
    const { data: associations, error: dbError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'destination')
      .eq('association_id', 'shelfLife')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('❌ Database query error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch shelf life documents' }, { status: 500 })
    }

    const documents = []
    
    if (associations && associations.length > 0) {
      for (const assoc of associations) {
        documents.push({
          id: assoc.document_id,
          filename: assoc.document_filename,
          fileName: assoc.document_filename,
          title: assoc.document_title,
          document_title: assoc.document_title,
          file_type: assoc.file_type,
          file_size: assoc.file_size,
          fileSize: assoc.file_size,
          storage_path: assoc.document_path,
          filePath: assoc.document_path,
          document_type: assoc.document_type,
          uploaded_at: assoc.created_at,
          source: 'database'
        })
      }
    }

    console.log('📄 Found shelf life documents:', documents.length)

    return NextResponse.json({ 
      documents,
      count: documents.length
    })

  } catch (error) {
    console.error('❌ Error fetching shelf life documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}