// Public Projects API - Get single project by slug
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params

    const project = await prisma.project.findUnique({
      where: { slug },
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
            tagline: true,
            icon: true,
          },
        },
        relatedProjects: {
          where: { isActive: true },
          select: {
            id: true,
            slug: true,
            name: true,
            featuredImage: true,
            thumbnailImage: true,
            tagline: true,
            serviceType: true,
            blurPlaceholders: true,
          },
        },
      },
    })

    if (!project) {
      return publicError('Project not found', 404)
    }

    return publicJson(project)
  } catch (error) {
    console.error('Public API Error [GET /api/public/projects/[slug]]:', error)
    return publicError('Failed to fetch project')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
