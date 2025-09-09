import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

// Mock notifications storage
let mockNotifications: any[] = []

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filter notifications for current user
    const userNotifications = mockNotifications.filter(n => n.userId === session.user.id)
    
    return NextResponse.json({ notifications: userNotifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ notifications: [] })
  }
}

// Function to create a notification (called by other parts of the system)
export async function createNotification(userId: string, type: string, title: string, message: string, from: string, documentId?: string) {
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    documentId,
    from,
    read: false,
    createdAt: new Date().toISOString()
  }
  
  mockNotifications.push(notification)
  console.log(`📧 Notification created for ${userId}: ${title}`)
  return notification
}