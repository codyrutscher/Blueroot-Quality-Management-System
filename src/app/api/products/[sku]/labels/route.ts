import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
) {
  try {
    const { sku } = params
    
    // Query labels that match the product SKU
    const { data: labels, error } = await supabase
      .from('labels')
      .select('*')
      .or(`product_sku.eq.${sku},filename.ilike.%${sku}%`)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching product labels from Supabase:', error)
      return NextResponse.json({ error: 'Failed to fetch product labels' }, { status: 500 })
    }

    // Transform data to match frontend expectations
    const transformedLabels = labels?.map(label => ({
      id: label.id,
      filename: label.filename,
      company: label.company,
      productSku: label.product_sku || sku,
      filePath: label.storage_path,
      uploadDate: label.uploaded_at,
      fileSize: label.file_size
    })) || []

    return NextResponse.json({ labels: transformedLabels })
  } catch (error) {
    console.error('Error fetching product labels:', error)
    return NextResponse.json({ error: 'Failed to fetch product labels' }, { status: 500 })
  }
}