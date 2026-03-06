// Media Bulk Move API - Move multiple media items to a folder
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// PATCH /api/admin/media/bulk-move - Move multiple media items to a folder
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, folder } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('ids must be a non-empty array', 400)
    }

    // folder can be null (move to unfiled) or a string
    if (folder !== null && typeof folder !== 'string') {
      return errorResponse('folder must be a string or null', 400)
    }

    const result = await prisma.media.updateMany({
      where: { id: { in: ids } },
      data: { folder: folder || null },
    })

    return successResponse({
      message: `Moved ${result.count} file(s) to ${folder ? `"${folder}"` : 'unfiled'}`,
      updatedCount: result.count,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
