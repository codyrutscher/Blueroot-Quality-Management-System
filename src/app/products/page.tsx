import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import ProductIndex from '@/components/ProductIndex'

export default async function ProductsPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  return <ProductIndex />
}