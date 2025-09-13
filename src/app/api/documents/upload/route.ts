import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const destinations = JSON.parse(formData.get('destinations') as string || '[]')
    const associations = JSON.parse(formData.get('associations') as string || '{}')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 })
    }

    if (!destinations || destinations.length === 0) {
      return NextResponse.json({ error: 'At least one destination is required' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`

    // Determine storage path based on primary destination
    let storagePath = ''
    if (destinations.includes('labels')) {
      storagePath = `labels/${uniqueFilename}`
    } else if (destinations.includes('shelfLife')) {
      storagePath = `shelf-life/${uniqueFilename}`
    } else if (destinations.includes('products')) {
      storagePath = `products/${uniqueFilename}`
    } else if (destinations.includes('suppliers')) {
      storagePath = `suppliers/${uniqueFilename}`
    } else if (destinations.includes('rawMaterials')) {
      storagePath = `raw-materials/${uniqueFilename}`
    } else {
      storagePath = `general/${uniqueFilename}`
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    // Create document record
    const documentRecord = {
      filename: file.name,
      original_filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      document_type: documentType,
      destinations: destinations,
      associations: associations,
      uploaded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    // Insert into documents table
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert(documentRecord)
      .select()
      .single()

    if (docError) {
      console.error('Database insert error:', docError)
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([storagePath])
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Create association records for specific destinations
    const associationPromises = []

    // Products associations
    if (destinations.includes('products') && associations.products?.length > 0) {
      for (const productId of associations.products) {
        associationPromises.push(
          supabase.from('document_associations').insert({
            document_id: docData.id,
            association_type: 'product',
            association_id: productId,
            created_at: new Date().toISOString()
          })
        )
      }
    }

    // Suppliers associations
    if (destinations.includes('suppliers') && associations.suppliers?.length > 0) {
      for (const supplierId of associations.suppliers) {
        associationPromises.push(
          supabase.from('document_associations').insert({
            document_id: docData.id,
            association_type: 'supplier',
            association_id: supplierId,
            created_at: new Date().toISOString()
          })
        )
      }
    }

    // Raw materials associations
    if (destinations.includes('rawMaterials') && associations.rawMaterials?.length > 0) {
      for (const materialId of associations.rawMaterials) {
        associationPromises.push(
          supabase.from('document_associations').insert({
            document_id: docData.id,
            association_type: 'raw_material',
            association_id: materialId,
            created_at: new Date().toISOString()
          })
        )
      }
    }

    // Labels - insert into labels table for backward compatibility
    if (destinations.includes('labels')) {
      await supabase.from('labels').insert({
        filename: file.name,
        company: 'General', // Default company for uploaded labels
        storage_path: storagePath,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    }

    // Execute all association inserts
    if (associationPromises.length > 0) {
      const results = await Promise.allSettled(associationPromises)
      const failures = results.filter(result => result.status === 'rejected')
      if (failures.length > 0) {
        console.warn('Some associations failed to create:', failures)
      }
    }

    return NextResponse.json({
      success: true,
      document: docData,
      message: 'Document uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}