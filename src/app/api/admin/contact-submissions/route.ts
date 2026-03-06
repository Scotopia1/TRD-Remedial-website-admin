// Admin Contact Submissions API - List and manage submissions
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/contact-submissions - List submissions with pagination/filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const countOnly = searchParams.get('countOnly')

    // If countOnly is requested, return just the unread count (for sidebar badge)
    if (countOnly === 'true') {
      const unreadCount = await prisma.contactSubmission.count({
        where: { status: 'unread' },
      })
      return successResponse({ unreadCount })
    }

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ]
    }

    const skip = (page - 1) * limit

    const [submissions, total, unreadCount] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactSubmission.count({ where }),
      prisma.contactSubmission.count({ where: { status: 'unread' } }),
    ])

    return successResponse({
      submissions,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/contact-submissions - Bulk delete submissions
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return successResponse({ error: 'No IDs provided' })
    }

    await prisma.contactSubmission.deleteMany({
      where: { id: { in: ids } },
    })

    return successResponse({ message: `${ids.length} submission(s) deleted successfully` })
  } catch (error) {
    return handleApiError(error)
  }
}
