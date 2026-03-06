// Services Reorder API - Batch update order values
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { triggerRevalidation } from '@/lib/revalidate'

// PATCH /api/admin/services/reorder
// Body: { items: [{ id: "xxx", order: 0 }, { id: "yyy", order: 1 }, ...] }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse('items must be a non-empty array of { id, order }', 400)
    }

    // Validate each item has id and order
    for (const item of items) {
      if (!item.id || typeof item.order !== 'number') {
        return errorResponse('Each item must have an id (string) and order (number)', 400)
      }
    }

    // Batch update using a transaction
    await prisma.$transaction(
      items.map(({ id, order }: { id: string; order: number }) =>
        prisma.service.update({
          where: { id },
          data: { order },
        })
      )
    )

    triggerRevalidation('service')

    return successResponse({ message: 'Service order updated successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
