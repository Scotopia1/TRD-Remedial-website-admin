// Services API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

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
        createdAt: 'desc'
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

    return successResponse(service, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
