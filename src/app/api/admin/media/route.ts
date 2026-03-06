// Media Library API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mediaSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/media - List all media files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mimeType = searchParams.get('mimeType')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const folder = searchParams.get('folder')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (mimeType) {
      where.mimeType = { startsWith: mimeType }
    }

    // Folder filtering: 'unfiled' = null folder, any other value = exact match
    if (folder === 'unfiled') {
      where.folder = null
    } else if (folder) {
      where.folder = folder
    }

    const media = await prisma.media.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) })
    })

    // Get total count for pagination
    const total = await prisma.media.count({
      where: Object.keys(where).length > 0 ? where : undefined
    })

    return successResponse({
      items: media,
      total,
      limit: limit ? parseInt(limit) : media.length,
      offset: offset ? parseInt(offset) : 0
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/media - Create new media entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = mediaSchema.parse(body)

    const media = await prisma.media.create({
      data: validatedData
    })

    return successResponse(media, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
