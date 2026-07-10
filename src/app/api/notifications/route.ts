import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db, ensureSeedData } = await import('@/lib/db')
        await ensureSeedData()
        const notifications = await db.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
        const unreadCount = await db.notification.count({
          where: { userId, isRead: false },
        })
        return NextResponse.json({ notifications, unreadCount })
      }
    } catch {
      // Fall through to demo data
    }

    // Demo notifications for memory fallback
    const demoNotifications = [
      { id: 'notif-1', userId, title: 'Welcome to 3 Boxes Jobs!', message: 'Complete your profile to increase your visibility to recruiters by up to 80%.', type: 'info', isRead: false, createdAt: new Date().toISOString(), link: null },
      { id: 'notif-2', userId, title: 'New Job Match Found', message: 'We found 5 new jobs matching your skills. Check them out in your dashboard!', type: 'success', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString(), link: '/dashboard/jobs' },
      { id: 'notif-3', userId, title: 'AI Skill Assessment Available', message: 'Take an AI-powered skill assessment to validate your expertise and boost your profile score.', type: 'info', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link: null },
    ]
    return NextResponse.json({ notifications: demoNotifications, unreadCount: 3 })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { notificationId, markAllRead, userId } = await request.json()

    // Try Prisma first if available
    try {
      const { memoryStore } = await import('@/lib/memory-store')
      if (await memoryStore.isDbAvailable()) {
        const { db } = await import('@/lib/db')
        if (markAllRead && userId) {
          await db.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
          return NextResponse.json({ message: 'All notifications marked as read' })
        }
        if (notificationId) {
          await db.notification.update({ where: { id: notificationId }, data: { isRead: true } })
          return NextResponse.json({ message: 'Notification marked as read' })
        }
      }
    } catch {
      // Fall through
    }

    // Demo mode - just return success
    return NextResponse.json({ message: 'Notifications marked as read (demo mode)' })
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
