// Public Testimonials API - List all active testimonials
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        quote: true,
        author: true,
        role: true,
        company: true,
        order: true,
      },
    })

    return publicJson(testimonials)
  } catch (error) {
    console.error('Public API Error [GET /api/public/testimonials]:', error)
    return publicError('Failed to fetch testimonials')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
