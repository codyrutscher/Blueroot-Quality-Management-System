import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Document upload API called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const documentTitle = formData.get('documentTitle') as string
    const destinations = JSON.parse(formData.get('destinations') as string || '[]')
    const associations = JSON.parse(formData.get('associations') as string || '{}')

    console.log('📋 Upload request details:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      documentType,
      documentTitle,
      destinations,
      associations
    })

    console.log('🔍 Checking association conditions:')
    console.log('  - destinations.includes("suppliers"):', destinations.includes('suppliers'))
    console.log('  - associations.suppliers:', associations.suppliers)
    console.log('  - associations.suppliers?.length:', associations.suppliers?.length)
    console.log('  - Will create supplier associations:', destinations.includes('suppliers') && associations.suppliers?.length > 0)

    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      console.error('❌ Document type is required')
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    if (!documentTitle || !documentTitle.trim()) {
      console.error('❌ Document title is required')
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 })
    }

    if (!destinations || destinations.length === 0) {
      console.error('❌ At least one destination is required')
      return NextResponse.json({ error: 'At least one destination is required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`

    // Determine storage path based on destinations (user's choice takes priority)
    let storagePath = ''
    
    // Prioritize user-selected destinations over document type
    if (destinations.includes('suppliers')) {
      storagePath = `suppliers/${uniqueFilename}`
    } else if (destinations.includes('products')) {
      storagePath = `products/${uniqueFilename}`
    } else if (destinations.includes('rawMaterials')) {
      storagePath = `raw-materials/${uniqueFilename}`
    } else if (destinations.includes('labels')) {
      storagePath = `labels/${uniqueFilename}`
    } else if (destinations.includes('shelfLife')) {
      storagePath = `shelf-life/${uniqueFilename}`
    } else {
      // Fallback to document type if no specific destination
      if (documentType.includes('Supplier') || documentType.includes('Co-Man')) {
        storagePath = `suppliers/${uniqueFilename}`
      } else if (documentType.includes('Label')) {
        storagePath = `labels/${uniqueFilename}`
      } else {
        storagePath = `general/${uniqueFilename}`
      }
    }

    console.log('📁 Uploading to storage path:', storagePath)
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file to storage', 
        details: uploadError.message 
      }, { status: 500 })
    }

    console.log('✅ File uploaded to storage successfully:', uploadData)

    // Create document record with proper associations
    const docData = {
      id: `upload_${timestamp}`,
      filename: file.name,
      document_title: documentTitle.trim(),
      storage_path: storagePath,
      document_type: documentType,
      destinations: destinations,
      associations: associations,
      uploaded_at: new Date().toISOString(),
      file_size: file.size,
      file_type: file.type
    }

    console.log('💾 Creating document record with associations:', docData)

    // Store document metadata in a simple JSON file for each destination
    try {
      // Create a metadata record for tracking
      const metadataRecord = {
        ...docData,
        created_at: new Date().toISOString()
      }

      // Store metadata as JSON file in storage for easy retrieval
      const metadataPath = `metadata/${docData.id}.json`
      const metadataBuffer = Buffer.from(JSON.stringify(metadataRecord, null, 2))
      
      await supabase.storage
        .from('documents')
        .upload(metadataPath, metadataBuffer, {
          contentType: 'text/plain',
          upsert: true
        })

      console.log('✅ Document metadata stored at:', metadataPath)
    } catch (metadataError) {
      console.warn('⚠️ Could not store metadata:', metadataError)
    }

    // Handle specific destinations and create proper associations
    console.log('🔗 Creating associations for destinations:', destinations)
    console.log('🔗 Association data:', associations)

    // Handle labels destination
    if (destinations.includes('labels')) {
      try {
        console.log('🏷️ Adding to labels table...')
        
        // Determine company from associations
        let company = 'General'
        if (associations.products && associations.products.length > 0) {
          // Try to get brand from first associated product
          const productSku = associations.products[0]
          console.log('🏷️ Looking up brand for product SKU:', productSku)
          
          // Get product info to determine brand/company
          try {
            const productResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/debug/products`)
            if (productResponse.ok) {
              const productData = await productResponse.json()
              const product = productData.products?.find((p: any) => p.sku === productSku)
              if (product?.brand) {
                company = product.brand
                console.log('🏷️ Found brand for label:', company)
              }
            }
          } catch (productError) {
            console.warn('⚠️ Could not fetch product for brand:', productError)
          }
        }

        const labelRecord = {
          filename: file.name,
          company: company,
          storage_path: storagePath,
          file_size: file.size,
          uploaded_at: new Date().toISOString(),
          product_sku: associations.products?.[0] || null,
          document_type: documentType
        }

        await supabase.from('labels').insert(labelRecord)
        console.log('✅ Added to labels table successfully:', labelRecord)
      } catch (labelError) {
        console.warn('⚠️ Could not add to labels table:', labelError)
      }
    }

    // Handle products destination - create product associations
    if (destinations.includes('products') && associations.products?.length > 0) {
      console.log('📦 Creating product associations...')
      
      for (const productSku of associations.products) {
        try {
          // Store association metadata in storage
          const associationRecord = {
            document_id: docData.id,
            document_filename: file.name,
            document_title: documentTitle.trim(),
            document_path: storagePath,
            document_type: documentType,
            product_sku: productSku,
            association_type: 'product',
            created_at: new Date().toISOString(),
            file_size: file.size,
            file_type: file.type
          }

          // Store as JSON file for easy retrieval
          const associationPath = `associations/product_${productSku}_${docData.id}.json`
          const associationBuffer = Buffer.from(JSON.stringify(associationRecord, null, 2))
          
          await supabase.storage
            .from('documents')
            .upload(associationPath, associationBuffer, {
              contentType: 'text/plain',
              upsert: true
            })

          console.log('✅ Created product association:', associationPath)
        } catch (assocError) {
          console.warn('⚠️ Could not create product association:', assocError)
        }
      }
    }

    // Handle suppliers destination
    console.log('🔍 About to check supplier associations...')
    console.log('🔍 Condition check - destinations includes suppliers:', destinations.includes('suppliers'))
    console.log('🔍 Condition check - associations.suppliers exists:', !!associations.suppliers)
    console.log('🔍 Condition check - associations.suppliers length:', associations.suppliers?.length)
    
    if (destinations.includes('suppliers') && associations.suppliers?.length > 0) {
      console.log('🏢 ✅ CONDITIONS MET - Creating supplier associations...')
      console.log('🏢 Supplier IDs from associations:', associations.suppliers)
      
      for (const supplierId of associations.suppliers) {
        console.log('🏢 Creating association for supplier ID:', supplierId)
        try {
          const associationRecord = {
            document_id: docData.id,
            document_filename: file.name,
            document_title: documentTitle.trim(),
            document_path: storagePath,
            document_type: documentType,
            supplier_id: supplierId,
            association_type: 'supplier',
            created_at: new Date().toISOString(),
            file_size: file.size,
            file_type: file.type
          }

          const associationPath = `associations/supplier_${supplierId}_${docData.id}.json`
          const associationBuffer = Buffer.from(JSON.stringify(associationRecord, null, 2))
          
          console.log('📤 Attempting to upload association file:', associationPath)
          console.log('📤 Association data:', associationRecord)
          
          const { data: uploadResult, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(associationPath, associationBuffer, {
              contentType: 'text/plain',
              upsert: true
            })

          if (uploadError) {
            console.error('❌ Failed to create supplier association:', uploadError)
            console.error('❌ Upload error details:', {
              message: uploadError.message,
              path: associationPath,
              bucketName: 'documents'
            })
          } else {
            console.log('✅ Created supplier association:', associationPath)
            console.log('✅ Association upload result:', uploadResult)
          }
        } catch (assocError) {
          console.error('❌ Could not create supplier association:', assocError)
          console.error('❌ Association error details:', {
            supplierId,
            associationPath,
            error: assocError instanceof Error ? assocError.message : assocError
          })
        }
      }
    } else {
      console.log('🏢 ❌ CONDITIONS NOT MET - Skipping supplier associations')
      console.log('🏢 Reason: destinations.includes("suppliers"):', destinations.includes('suppliers'))
      console.log('🏢 Reason: associations.suppliers?.length > 0:', associations.suppliers?.length > 0)
    }

    // Handle raw materials destination
    if (destinations.includes('rawMaterials') && associations.rawMaterials?.length > 0) {
      console.log('🧪 Creating raw material associations...')
      
      for (const materialId of associations.rawMaterials) {
        try {
          const associationRecord = {
            document_id: docData.id,
            document_filename: file.name,
            document_title: documentTitle.trim(),
            document_path: storagePath,
            document_type: documentType,
            material_id: materialId,
            association_type: 'raw_material',
            created_at: new Date().toISOString(),
            file_size: file.size,
            file_type: file.type
          }

          const associationPath = `associations/material_${materialId}_${docData.id}.json`
          const associationBuffer = Buffer.from(JSON.stringify(associationRecord, null, 2))
          
          await supabase.storage
            .from('documents')
            .upload(associationPath, associationBuffer, {
              contentType: 'text/plain',
              upsert: true
            })

          console.log('✅ Created raw material association:', associationPath)
        } catch (assocError) {
          console.warn('⚠️ Could not create raw material association:', assocError)
        }
      }
    }

    console.log('🎉 Upload completed successfully!')
    
    // Count associations created
    let associationsCreated = 0
    if (destinations.includes('suppliers') && associations.suppliers?.length > 0) {
      associationsCreated += associations.suppliers.length
    }
    if (destinations.includes('products') && associations.products?.length > 0) {
      associationsCreated += associations.products.length
    }
    if (destinations.includes('rawMaterials') && associations.rawMaterials?.length > 0) {
      associationsCreated += associations.rawMaterials.length
    }
    
    return NextResponse.json({
      success: true,
      document: docData,
      message: 'Document uploaded successfully',
      debug: {
        associationsCreated,
        destinations,
        supplierIds: associations.suppliers || [],
        storagePath
      }
    })

  } catch (error) {
    console.error('❌ Upload error:', error)
    console.error('❌ Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}