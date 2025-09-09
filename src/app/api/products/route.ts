import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { supabase } from '@/lib/supabase'

// Mock data fallback
const mockProducts = [
  {
    id: 'prod-BFCAPSADEK',
    brand: 'Bariatric Fusion',
    sku: 'BFCAPSADEK',
    productName: 'Multivitamin Three Per Day ADEK 90ct Capsule',
    healthCategory: 'Foundational Health & Wellness',
    therapeuticPlatform: 'Metabolic',
    nutrientType: 'Multivitamins, Vitamins & Minerals',
    format: 'Capsule',
    numberOfActives: 'Multiple',
    bottleCount: '90',
    unitCount: 90,
    manufacturer: 'BRH',
    containsIron: true,
    documents: []
  },
  {
    id: 'prod-BFCAPSB50',
    brand: 'Bariatric Fusion',
    sku: 'BFCAPSB50',
    productName: 'B-50 Complex 90ct',
    healthCategory: 'Foundational Health & Wellness',
    therapeuticPlatform: 'Metabolic',
    nutrientType: 'Multivitamins, Vitamins & Minerals',
    format: 'Capsule',
    numberOfActives: 'Multiple',
    bottleCount: '90',
    unitCount: 90,
    manufacturer: 'BRH',
    containsIron: false,
    documents: []
  },
  {
    id: 'prod-BFCAPSBIOTIN5000',
    brand: 'Bariatric Fusion',
    sku: 'BFCAPSBIOTIN5000',
    productName: 'Biotin 5mg',
    healthCategory: 'Foundational Health & Wellness',
    therapeuticPlatform: 'Metabolic',
    nutrientType: 'Multivitamins, Vitamins & Minerals',
    format: 'Capsule',
    numberOfActives: 'Single',
    bottleCount: '90',
    unitCount: 90,
    manufacturer: 'BRH',
    containsIron: false,
    documents: []
  }
]

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        documents!documents_productId_fkey(*)
      `)
      .order('productName', { ascending: true })

    if (error) {
      console.error('Products API error:', error)
      return NextResponse.json({ products: mockProducts })
    }

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ products: mockProducts })
  }
}