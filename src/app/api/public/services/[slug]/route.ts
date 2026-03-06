// Public Services API - Get single service by slug
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const service = await prisma.service.findUnique({
      where: { slug },
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
        projects: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            slug: true,
            name: true,
            location: true,
            serviceType: true,
            featuredImage: true,
            thumbnailImage: true,
            tagline: true,
            categories: true,
            blurPlaceholders: true,
          },
        },
      },
    })

    if (!service) {
      return publicError('Service not found', 404)
    }

    return publicJson(service)
  } catch (error) {
    console.error('Public API Error [GET /api/public/services/[slug]]:', error)
    return publicError('Failed to fetch service')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
