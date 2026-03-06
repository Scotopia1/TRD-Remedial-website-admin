// Services API - Get, Update, Delete individual service
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/services/[id] - Get single service
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
          }
        }
      }
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    return successResponse(service)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/services/[id] - Update service
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = serviceUpdateSchema.parse(body)

    const service = await prisma.service.update({
      where: { id },
      data: validatedData,
      include: {
        projects: true
      }
    })

    return successResponse(service)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/services/[id] - Delete service
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if service has projects
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    if (service._count.projects > 0) {
      return errorResponse(
        `Cannot delete service with ${service._count.projects} associated projects`,
        400
      )
    }

    await prisma.service.delete({
      where: { id }
    })

    return successResponse({ message: 'Service deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
