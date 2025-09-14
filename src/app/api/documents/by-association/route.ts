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
    
    console.log('🔍 Fetching documents for:', { associationType, associationId })
    
    if (!associationType || !associationId) {
      return NextResponse.json({ error: 'Association type and ID are required' }, { status: 400 })
    }

    const documents = []

    // Skip database approach for now since we're using storage-based system
    console.log('📁 Using storage-based document system...')

    // Fetch from storage-based associations
    try {
      console.log('📁 Fetching from storage associations...')
      
      // List association files for this type and ID
      const associationPrefix = `associations/${associationType}_${associationId}_`
      
      const { data: files, error: listError } = await supabase.storage
        .from('documents')
        .list('associations', {
          search: `${associationType}_${associationId}_`
        })

      if (!listError && files?.length > 0) {
        console.log('📄 Found association files:', files.length)
        
        for (const file of files) {
          try {
            // Download and parse each association file
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('documents')
              .download(`associations/${file.name}`)

            if (!downloadError && fileData) {
              const text = await fileData.text()
              const associationData = JSON.parse(text)
              
              documents.push({
                id: associationData.document_id,
                filename: associationData.document_filename,
                file_type: associationData.file_type,
                file_size: associationData.file_size,
                storage_path: associationData.document_path,
                document_type: associationData.document_type,
                uploaded_at: associationData.created_at,
                association_type: associationType,
                source: 'storage'
              })
            }
          } catch (parseError) {
            console.warn('⚠️ Could not parse association file:', file.name, parseError)
          }
        }
      }
    } catch (storageError) {
      console.warn('⚠️ Storage query failed:', storageError)
    }

    // For labels, also check the labels table
    if (associationType === 'product') {
      try {
        const { data: labels, error: labelsError } = await supabase
          .from('labels')
          .select('*')
          .eq('product_sku', associationId)

        if (!labelsError && labels?.length > 0) {
          console.log('🏷️ Found labels for product:', labels.length)
          
          labels.forEach(label => {
            documents.push({
              id: `label_${label.id}`,
              filename: label.filename,
              file_type: 'label',
              file_size: label.file_size,
              storage_path: label.storage_path,
              document_type: 'Label',
              uploaded_at: label.uploaded_at,
              association_type: 'label',
              source: 'labels_table',
              company: label.company
            })
          })
        }
      } catch (labelsError) {
        console.warn('⚠️ Could not fetch labels:', labelsError)
      }
    }

    console.log('📊 Total documents found:', documents.length)

    return NextResponse.json({ 
      documents,
      count: documents.length
    })

  } catch (error) {
    console.error('❌ Error fetching documents by association:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}