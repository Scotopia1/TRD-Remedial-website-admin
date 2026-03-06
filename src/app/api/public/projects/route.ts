// Public Projects API - List all active projects
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        location: true,
        date: true,
        serviceType: true,
        serviceId: true,
        categories: true,
        featuredImage: true,
        thumbnailImage: true,
        heroImage: true,
        tagline: true,
        challenge: true,
        solution: true,
        results: true,
        beforeImage: true,
        afterImage: true,
        galleryImages: true,
        stats: true,
        testimonial: true,
        timeline: true,
        budget: true,
        blurPlaceholders: true,
        metaTitle: true,
        metaDescription: true,
        order: true,
        service: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    })

    return publicJson(projects)
  } catch (error) {
    console.error('Public API Error [GET /api/public/projects]:', error)
    return publicError('Failed to fetch projects')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
