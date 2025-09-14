import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Label {
  id: string
  filename: string
  company: string
  product_sku?: string
  storage_path: string
  uploaded_at: string
  file_size?: number
}

export async function GET() {
  try {
    console.log('🏷️ Fetching labels from both old table and new associations...')
    
    let allLabels: any[] = []

    // Fetch from old labels table (if it exists)
    try {
      const { data: oldLabels, error: oldError } = await supabase
        .from('labels')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (!oldError && oldLabels) {
        console.log('📄 Found old labels:', oldLabels.length)
        const transformedOldLabels = oldLabels.map(label => ({
          id: label.id,
          filename: label.filename,
          company: label.company,
          productSku: label.product_sku,
          filePath: label.storage_path,
          uploadDate: label.uploaded_at,
          fileSize: label.file_size,
          source: 'old_table'
        }))
        allLabels.push(...transformedOldLabels)
      }
    } catch (oldTableError) {
      console.warn('⚠️ Old labels table not accessible:', oldTableError)
    }

    // Fetch from new destination associations
    try {
      const { data: labelAssociations, error: assocError } = await supabase
        .from('document_associations')
        .select('*')
        .eq('association_type', 'destination')
        .eq('association_id', 'labels')
        .order('created_at', { ascending: false })

      if (!assocError && labelAssociations) {
        console.log('📄 Found new label associations:', labelAssociations.length)
        const transformedNewLabels = labelAssociations.map(assoc => ({
          id: assoc.document_id,
          filename: assoc.document_filename,
          company: 'General', // Default company, will be updated with brand selection
          productSku: null,
          filePath: assoc.document_path,
          uploadDate: assoc.created_at,
          fileSize: assoc.file_size,
          documentTitle: assoc.document_title,
          documentType: assoc.document_type,
          source: 'new_associations'
        }))
        allLabels.push(...transformedNewLabels)
      }
    } catch (assocError) {
      console.error('❌ Error fetching label associations:', assocError)
    }

    console.log('📊 Total labels found:', allLabels.length)

    return NextResponse.json({ labels: allLabels })
  } catch (error) {
    console.error('❌ Error fetching labels:', error)
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
  }
}