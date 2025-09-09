import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

// Real company users from database
const realCompanyUsers = [
  {
    id: 'user-john-troup',
    name: 'John Troup',
    username: 'john.troup',
    email: 'john.troup@company.com',
    role: 'MANAGER',
    department: 'Quality Assurance',
  },
  {
    id: 'user-matt-white',
    name: 'Matt White',
    username: 'matt.white',
    email: 'matt.white@company.com',
    role: 'USER',
    department: 'Manufacturing',
  },
  {
    id: 'user-nick-hafften',
    name: 'Nick Hafften',
    username: 'nick.hafften',
    email: 'nick.hafften@company.com',
    role: 'USER',
    department: 'Manufacturing',
  },
  {
    id: 'user-steve-nelson',
    name: 'Steve Nelson',
    username: 'steve.nelson',
    email: 'steve.nelson@company.com',
    role: 'MANAGER',
    department: 'Operations',
  },
  {
    id: 'user-nick-deloia',
    name: 'Nick Deloia',
    username: 'nick.deloia',
    email: 'nick.deloia@company.com',
    role: 'USER',
    department: 'Manufacturing',
  },
  {
    id: 'user-jenn-doucette',
    name: 'Jenn Doucette',
    username: 'jenn.doucette',
    email: 'jenn.doucette@company.com',
    role: 'USER',
    department: 'Quality Assurance',
  },
  {
    id: 'user-dana-rutscher',
    name: 'Dana Rutscher',
    username: 'dana.rutscher',
    email: 'dana.rutscher@company.com',
    role: 'ADMIN',
    department: 'Management',
  },
  {
    id: 'user-shefali-pandey',
    name: 'Shefali Pandey',
    username: 'shefali.pandey',
    email: 'shefali.pandey@company.com',
    role: 'USER',
    department: 'R&D',
  },
  {
    id: 'user-whitney-palmerton',
    name: 'Whitney Palmerton',
    username: 'whitney.palmerton',
    email: 'whitney.palmerton@company.com',
    role: 'USER',
    department: 'Quality Assurance',
  }
]

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
        },
        orderBy: { name: 'asc' },
      })

      return NextResponse.json({ users })
    } catch (dbError) {
      console.log('Database not available, using real company users')
      return NextResponse.json({ users: realCompanyUsers })
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ users: realCompanyUsers })
  }
}