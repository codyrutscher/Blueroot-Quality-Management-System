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
    console.log('🔍 Full request URL:', request.url)
    
    if (!associationType || !associationId) {
      return NextResponse.json({ error: 'Association type and ID are required' }, { status: 400 })
    }

    const documents = []

    // Fetch from database associations
    try {
      console.log('💾 Fetching from database associations...')
      console.log('🔍 Searching for associations with type:', associationType, 'and ID:', associationId)
      
      const { data: associations, error: dbError } = await supabase
        .from('document_associations')
        .select('*')
        .eq('association_type', associationType)
        .eq('association_id', associationId)
        .order('created_at', { ascending: false })

      if (dbError) {
        console.error('❌ Database query error:', dbError)
      } else {
        console.log('📄 Found database associations:', associations?.length || 0)
        
        if (associations && associations.length > 0) {
          for (const assoc of associations) {
            documents.push({
              id: assoc.document_id,
              filename: assoc.document_filename,
              fileName: assoc.document_filename, // Add camelCase version
              title: assoc.document_title, // Add title field
              document_title: assoc.document_title, // Keep snake_case version too
              file_type: assoc.file_type,
              file_size: assoc.file_size,
              fileSize: assoc.file_size, // Add camelCase version
              storage_path: assoc.document_path,
              filePath: assoc.document_path, // Add camelCase version for download
              document_type: assoc.document_type,
              uploaded_at: assoc.created_at,
              association_type: associationType,
              source: 'database'
            })
          }
        }
      }
    } catch (dbError) {
      console.warn('⚠️ Database query failed:', dbError)
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

    // Also check for documents uploaded to this destination without specific associations
    try {
      console.log(`📁 Checking for general ${associationType} documents...`)
      
      // Map association types to destination names used in upload
      const destinationMap: { [key: string]: string } = {
        'product': 'products',
        'supplier': 'suppliers', 
        'raw_material': 'rawMaterials',
        'label': 'labels',
        'shelf_life': 'shelfLife'
      }
      
      const destinationName = destinationMap[associationType]
      
      if (destinationName) {
        // List all metadata files to find documents uploaded to this destination
        const { data: metadataFiles, error: metadataError } = await supabase.storage
          .from('documents')
          .list('metadata')

        if (!metadataError && metadataFiles?.length > 0) {
          console.log(`🔍 Found ${metadataFiles.length} metadata files to check`)
          
          for (const metadataFile of metadataFiles) {
            try {
              // Download and parse each metadata file
              const { data: fileData, error: downloadError } = await supabase.storage
                .from('documents')
                .download(`metadata/${metadataFile.name}`)

              if (!downloadError && fileData) {
                const text = await fileData.text()
                const metadata = JSON.parse(text)
                
                // Check if this document was uploaded to the matching destination
                if (metadata.destinations?.includes(destinationName)) {
                  // Add if not already in documents list
                  const alreadyExists = documents.some(doc => doc.id === metadata.id)
                  if (!alreadyExists) {
                    documents.push({
                      id: metadata.id,
                      filename: metadata.filename,
                      file_type: metadata.file_type,
                      file_size: metadata.file_size,
                      storage_path: metadata.storage_path,
                      document_type: metadata.document_type,
                      uploaded_at: metadata.uploaded_at,
                      association_type: 'destination',
                      source: 'destination_upload'
                    })
                    console.log(`✅ Added ${destinationName} document: ${metadata.filename}`)
                  }
                }
              }
            } catch (parseError) {
              console.warn('⚠️ Could not parse metadata file:', metadataFile.name)
            }
          }
        }
      }
    } catch (generalError) {
      console.warn('⚠️ General document search failed:', generalError)
    }

    console.log('📊 Total documents found:', documents.length)
    console.log('📊 Documents being returned:', documents.map(d => ({ 
      id: d.id, 
      filename: d.filename, 
      title: d.title,
      association_type: d.association_type 
    })))

    return NextResponse.json({ 
      documents,
      count: documents.length,
      debug: {
        associationType,
        associationId,
        searchPerformed: true
      }
    })

  } catch (error) {
    console.error('❌ Error fetching documents by association:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}