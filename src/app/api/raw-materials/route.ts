import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching raw materials...')
    
    // Test connection with a simple query
    const { data: testData, error: testError } = await supabase
      .from('raw_materials')
      .select('count')
      .limit(1)

    if (testError) {
      console.log('Raw materials connection error:', testError)
      console.log('⚠️ Raw materials connection failed, falling back to CSV:', testError.message)
      
      // Return fallback data
      return NextResponse.json({
        rawMaterials: [
          { id: 'RM5HTP', name: '5HTP' },
          { id: 'RM5MTHF', name: 'L-5-Methyltetrahydrofolic Acid' },
          { id: 'RM7KETODHEA', name: '7-Keto-DHEA' },
          { id: 'RMACETL-CARN', name: 'Acetyl-L-Carnitine HCL' },
          { id: 'RMADRENALCORTE', name: 'Adrenal Cortex Bovine' },
          { id: 'RMADRENALWHOLE', name: 'Adrenal Whole Bovine' },
          { id: 'RMALGALDHA', name: 'Vegan Omega 3 powder 30% DHA' },
          { id: 'RMALGALDHA20%', name: 'Deodorized Algal DHA 20%' },
          { id: 'RM00CAP', name: '#00 Size Gel Capsule 70M/cs' },
          { id: 'RM00CAPVEG', name: '#00 Size VEG Capsule 70M/cs' },
          { id: 'RM0CAP', name: '#0 Size Gel Capsule 100M/cs' },
          { id: 'RM0CAPVEG', name: '#0 Size VEG Capsule 100M/cs' },
          { id: 'RM1CAPVEG', name: '#1 Size VEG Capsule 130M/cs' },
          { id: 'RM3CAPVEG', name: '#3 Size Veg Capsule 240,000/cs' }
        ]
      })
    }

    // If connection works, fetch actual data
    const { data: rawMaterials, error } = await supabase
      .from('raw_materials')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching raw materials:', error)
      return NextResponse.json({ error: 'Failed to fetch raw materials' }, { status: 500 })
    }

    return NextResponse.json({ rawMaterials: rawMaterials || [] })

  } catch (error) {
    console.error('Raw materials API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}