// Services API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { triggerRevalidation } from '@/lib/revalidate'

// GET /api/admin/services - List all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return successResponse(services)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    const service = await prisma.service.create({
      data: validatedData,
      include: {
        projects: true
      }
    })

    triggerRevalidation('service')

    return successResponse(service, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
