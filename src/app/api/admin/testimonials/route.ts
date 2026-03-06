import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { testimonialSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/testimonials - List all testimonials
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
    })
    return successResponse(testimonials)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = testimonialSchema.parse(body)

    const testimonial = await prisma.testimonial.create({
      data: validatedData,
    })

    return successResponse(testimonial, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
