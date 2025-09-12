import { getServerSession } from 'next-auth/next'
import Dashboard from '@/components/Dashboard'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const session = await getServerSession()
  
  if (!session) {
    return <LandingPage />
  }

  return <Dashboard />
}
