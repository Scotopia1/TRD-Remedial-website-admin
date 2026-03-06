// Public Services API - List all active services
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        title: true,
        tagline: true,
        description: true,
        features: true,
        benefits: true,
        icon: true,
        visual: true,
        heroImage: true,
        featureImage: true,
        processImage: true,
        detailPage: true,
        stats: true,
        process: true,
        commonApplications: true,
        whyChooseTRD: true,
        serviceArea: true,
        relatedServiceSlugs: true,
        faqs: true,
        testimonials: true,
        metaTitle: true,
        metaDescription: true,
        order: true,
      },
    })

    return publicJson(services)
  } catch (error) {
    console.error('Public API Error [GET /api/public/services]:', error)
    return publicError('Failed to fetch services')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
