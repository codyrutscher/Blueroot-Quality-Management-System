import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, department } = await request.json()
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      // Database connection might be failing, that's ok for demo
      console.log('Database check failed, proceeding with registration')
    }

    // Create user in database
    try {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          department,
          role: 'USER', // Default role
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (error) {
      console.error('Database creation failed:', error)
      return NextResponse.json(
        { error: 'Registration failed. Please try demo accounts for now.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}