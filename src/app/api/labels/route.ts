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
    const { data: labels, error } = await supabase
      .from('labels')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching labels from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedLabels = labels?.map(label => ({
      id: label.id,
      filename: label.filename,
      company: label.company,
      productSku: label.product_sku,
      filePath: label.storage_path,
      uploadDate: label.uploaded_at,
      fileSize: label.file_size
    })) || []

    return NextResponse.json({ labels: transformedLabels })
  } catch (error) {
    console.error('Error fetching labels:', error)
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 })
  }
}