import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test connection with a simple query
    const { data: testData, error: testError } = await supabase
      .from('suppliers')
      .select('count')
      .limit(1)

    if (testError) {
      console.log('Supabase connection error:', testError)
      console.log('⚠️ Supabase connection failed, trying to fetch actual data anyway...')
    }

    // Try to fetch actual data from Supabase
    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching suppliers from Supabase:', error)
      console.log('⚠️ Falling back to hardcoded supplier list')
      
      // Return fallback data with consistent IDs
      return NextResponse.json({
        suppliers: [
          { id: '20da556e-d69b-4748-b929-21e3dfae8922', name: 'ANS' },
          { id: '24b1f09d-1aa0-4b51-b45d-89461cc5c6ae', name: 'AIDP, Inc.' },
          { id: 'food-pharma', name: 'Food Pharma' },
          { id: 'inw', name: 'INW' },
          { id: 'mill-haven', name: 'Mill Haven Foods' },
          { id: 'multipack', name: 'MultiPack' },
          { id: 'nutrastar', name: 'Nutrastar' },
          { id: 'probi', name: 'Probi' },
          { id: 'spice-hut', name: 'Spice Hut' },
          { id: 'steuart', name: 'Steuart Packaging' },
          { id: 'vitaquest', name: 'Vitaquest' },
          { id: 'ajinomoto', name: 'Ajinomoto Health and Nutrition North America, Inc' },
          { id: 'anderson', name: 'Anderson Advanced Ingredients' },
          { id: 'bd-nutritional', name: 'B&D Nutritional Products' },
          { id: 'catherych', name: 'Catherych (PharmaCap)' },
          { id: 'centian', name: 'Centian LLC' },
          { id: 'draco', name: 'Draco Natural Products' },
          { id: 'euromed', name: 'Euromed USA' },
          { id: 'fci-flavors', name: 'FCI Flavors' },
          { id: 'fifth-nutrisupply', name: 'Fifth Nutrisupply, Inc' }
        ]
      })
    }

    console.log('✅ Successfully fetched suppliers from Supabase:', suppliers?.length || 0)
    return NextResponse.json({ suppliers: suppliers || [] })

  } catch (error) {
    console.error('Suppliers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}