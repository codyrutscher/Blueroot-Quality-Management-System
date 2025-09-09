import { NextResponse } from 'next/server'
import { allProducts } from '@/data/products'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get document counts for each product from Supabase, joining with products table
    const { data: documentCounts } = await supabase
      .from('documents')
      .select(`
        productId,
        product:products!documents_productId_fkey(sku)
      `)
      .not('productId', 'is', null)

    // Count documents per product SKU
    const countsBySku = {}
    if (documentCounts) {
      documentCounts.forEach(doc => {
        if (doc.product?.sku) {
          countsBySku[doc.product.sku] = (countsBySku[doc.product.sku] || 0) + 1
        }
      })
    }

    console.log('Document counts by SKU:', countsBySku)

    // Add document counts to products
    const productsWithCounts = allProducts.map(product => ({
      ...product,
      documents: new Array(countsBySku[product.sku] || 0).fill(null)
    }))

    return NextResponse.json({ products: productsWithCounts })
  } catch (error) {
    console.error('Error fetching document counts:', error)
    // Fallback to original products without counts
    return NextResponse.json({ products: allProducts })
  }
}