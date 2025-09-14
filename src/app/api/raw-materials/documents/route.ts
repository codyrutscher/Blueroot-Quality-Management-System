import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('id')
    
    console.log('🧪 Fetching raw material documents for ID:', materialId)
    
    let documents = []

    if (materialId) {
      // Get documents for specific raw material
      const { data: associations, error: dbError } = await supabase
        .from('document_associations')
        .select('*')
        .eq('association_type', 'raw_material')
        .eq('association_id', materialId)
        .order('created_at', { ascending: false })

      if (!dbError && associations) {
        documents = associations.map(assoc => ({
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
        }))
      }
    } else {
      // Get all raw material documents
      const { data: associations, error: dbError } = await supabase
        .from('document_associations')
        .select('*')
        .eq('association_type', 'raw_material')
        .order('created_at', { ascending: false })

      if (!dbError && associations) {
        documents = associations.map(assoc => ({
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
          association_id: assoc.association_id,
          source: 'database'
        }))
      }
    }

    console.log('📄 Found raw material documents:', documents.length)

    return NextResponse.json({ 
      documents,
      count: documents.length
    })

  } catch (error) {
    console.error('❌ Error fetching raw material documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}