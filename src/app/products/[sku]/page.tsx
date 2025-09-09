import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import ProductDetail from '@/components/ProductDetail'

interface ProductPageProps {
  params: Promise<{
    sku: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const { sku } = await params

  return <ProductDetail sku={sku} />
}