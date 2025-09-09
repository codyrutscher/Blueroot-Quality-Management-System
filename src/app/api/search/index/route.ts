import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { indexAllTemplates, indexAllProducts, indexTemplateContent, indexProductContent } from '@/lib/search-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, type, id } = await request.json()
    
    if (action === 'index-all') {
      if (type === 'templates') {
        await indexAllTemplates()
        return NextResponse.json({ message: 'All templates indexed successfully' })
      } else if (type === 'products') {
        await indexAllProducts()
        return NextResponse.json({ message: 'All products indexed successfully' })
      } else if (type === 'all') {
        await Promise.all([
          indexAllTemplates(),
          indexAllProducts()
        ])
        return NextResponse.json({ message: 'All content indexed successfully' })
      }
    } else if (action === 'index-single') {
      if (type === 'template' && id) {
        await indexTemplateContent(id)
        return NextResponse.json({ message: 'Template indexed successfully' })
      } else if (type === 'product' && id) {
        await indexProductContent(id)
        return NextResponse.json({ message: 'Product indexed successfully' })
      }
    }
    
    return NextResponse.json({ error: 'Invalid action or type' }, { status: 400 })
  } catch (error) {
    console.error('Indexing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}