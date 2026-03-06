import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { testimonialUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/testimonials/[id] - Get single testimonial
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return errorResponse('Testimonial not found', 404)
    }

    return successResponse(testimonial)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/testimonials/[id] - Update testimonial
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = testimonialUpdateSchema.parse(body)

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validatedData,
    })

    return successResponse(testimonial)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/testimonials/[id] - Delete testimonial
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.testimonial.delete({
      where: { id },
    })

    return successResponse({ message: 'Testimonial deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
