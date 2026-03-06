// Case Studies API - Get, Update, Delete individual case study
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { caseStudyUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/case-studies/[id] - Get single case study
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id }
    })

    if (!caseStudy) {
      return errorResponse('Case study not found', 404)
    }

    return successResponse(caseStudy)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/case-studies/[id] - Update case study
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = caseStudyUpdateSchema.parse(body)

    const caseStudy = await prisma.caseStudy.update({
      where: { id },
      data: validatedData
    })

    return successResponse(caseStudy)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/case-studies/[id] - Delete case study
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.caseStudy.delete({
      where: { id }
    })

    return successResponse({ message: 'Case study deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
