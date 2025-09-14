import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productSku = searchParams.get('sku')
    
    console.log('🔍 Checking product associations for SKU:', productSku)
    
    // Get all product associations
    const { data: allProductAssociations, error: allError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'product')
      .order('created_at', { ascending: false })

    // Get specific product associations if SKU provided
    let specificAssociations = []
    if (productSku) {
      const { data: specificData, error: specificError } = await supabase
        .from('document_associations')
        .select('*')
        .eq('association_type', 'product')
        .eq('association_id', productSku)

      if (!specificError) {
        specificAssociations = specificData || []
      }
    }

    return NextResponse.json({
      success: true,
      searchedSku: productSku,
      allProductAssociations: {
        count: allProductAssociations?.length || 0,
        data: allProductAssociations || []
      },
      specificAssociations: {
        count: specificAssociations.length,
        data: specificAssociations
      },
      uniqueProductSkus: [...new Set(allProductAssociations?.map(a => a.association_id) || [])]
    })

  } catch (error) {
    console.error('❌ Check product associations error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}