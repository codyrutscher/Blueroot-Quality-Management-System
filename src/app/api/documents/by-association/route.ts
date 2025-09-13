import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const associationType = searchParams.get('type') // 'product', 'supplier', 'raw_material'
    const associationId = searchParams.get('id')
    
    if (!associationType || !associationId) {
      return NextResponse.json({ error: 'Association type and ID are required' }, { status: 400 })
    }

    // Get documents associated with the specified item
    const { data: associations, error: assocError } = await supabase
      .from('document_associations')
      .select(`
        document_id,
        documents (
          id,
          filename,
          original_filename,
          file_type,
          file_size,
          storage_path,
          document_type,
          destinations,
          uploaded_at,
          created_at
        )
      `)
      .eq('association_type', associationType)
      .eq('association_id', associationId)

    if (assocError) {
      console.error('Error fetching document associations:', assocError)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    // Also get documents that are in general destinations (labels, shelf-life)
    const { data: generalDocs, error: generalError } = await supabase
      .from('documents')
      .select('*')
      .contains('destinations', JSON.stringify(['labels']))
      .or(`destinations.cs.["shelfLife"]`)

    if (generalError) {
      console.warn('Error fetching general documents:', generalError)
    }

    // Transform the data
    const documents = associations?.map(assoc => ({
      ...assoc.documents,
      association_type: associationType
    })) || []

    return NextResponse.json({ 
      documents,
      count: documents.length
    })

  } catch (error) {
    console.error('Error fetching documents by association:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}