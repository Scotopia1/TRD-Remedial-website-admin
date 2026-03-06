// Company Values API - Get, Update, Delete individual value
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { companyValueUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/values/[id] - Get single company value
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const value = await prisma.companyValue.findUnique({
      where: { id }
    })

    if (!value) {
      return errorResponse('Company value not found', 404)
    }

    return successResponse(value)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/values/[id] - Update company value
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = companyValueUpdateSchema.parse(body)

    const value = await prisma.companyValue.update({
      where: { id },
      data: validatedData
    })

    return successResponse(value)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/values/[id] - Delete company value
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.companyValue.delete({
      where: { id }
    })

    return successResponse({ message: 'Company value deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
