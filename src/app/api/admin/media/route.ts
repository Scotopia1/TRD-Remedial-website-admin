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

    const media = await prisma.media.findMany({
      where: mimeType ? {
        mimeType: {
          startsWith: mimeType // e.g., 'image/' for all images
        }
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) })
    })

    // Get total count for pagination
    const total = await prisma.media.count({
      where: mimeType ? {
        mimeType: {
          startsWith: mimeType
        }
      } : undefined
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
