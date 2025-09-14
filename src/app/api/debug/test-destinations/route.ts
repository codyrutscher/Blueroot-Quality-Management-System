import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing all destination document routes...')
    
    // Test Labels documents
    const { data: labelsAssoc, error: labelsError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'destination')
      .eq('association_id', 'labels')

    // Test Shelf Life documents  
    const { data: shelfLifeAssoc, error: shelfLifeError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'destination')
      .eq('association_id', 'shelfLife')

    // Test Raw Materials documents
    const { data: rawMaterialsAssoc, error: rawMaterialsError } = await supabase
      .from('document_associations')
      .select('*')
      .eq('association_type', 'raw_material')

    return NextResponse.json({
      success: true,
      labels: {
        count: labelsAssoc?.length || 0,
        documents: labelsAssoc || [],
        error: labelsError?.message || null
      },
      shelfLife: {
        count: shelfLifeAssoc?.length || 0,
        documents: shelfLifeAssoc || [],
        error: shelfLifeError?.message || null
      },
      rawMaterials: {
        count: rawMaterialsAssoc?.length || 0,
        documents: rawMaterialsAssoc || [],
        error: rawMaterialsError?.message || null
      }
    })

  } catch (error) {
    console.error('❌ Test destinations error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}