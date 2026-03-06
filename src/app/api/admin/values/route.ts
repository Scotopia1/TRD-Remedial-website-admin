// Company Values API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companyValueSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/values - List all company values
export async function GET() {
  try {
    const values = await prisma.companyValue.findMany({
      orderBy: {
        order: 'asc'
      }
    })

    return successResponse(values)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/values - Create new company value
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = companyValueSchema.parse(body)

    // Auto-increment order if not provided
    if (validatedData.order === 0 || validatedData.order === undefined) {
      const maxOrder = await prisma.companyValue.aggregate({
        _max: { order: true }
      })
      validatedData.order = (maxOrder._max.order || 0) + 1
    }

    const value = await prisma.companyValue.create({
      data: validatedData
    })

    return successResponse(value, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
