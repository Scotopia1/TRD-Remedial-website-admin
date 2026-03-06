// Projects API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { projectSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')

    const projects = await prisma.project.findMany({
      where: serviceId ? { serviceId } : undefined,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        teamMembers: {
          select: {
            id: true,
            name: true,
            title: true,
          }
        },
        _count: {
          select: {
            relatedProjects: true,
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return successResponse(projects)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Extract relatedProjectSlugs before schema validation
    const { relatedProjectSlugs, ...rest } = body
    const validatedData = projectSchema.parse(rest)

    // Resolve related project IDs from slugs
    let relatedProjectsConnect: { id: string }[] = []
    if (relatedProjectSlugs && Array.isArray(relatedProjectSlugs) && relatedProjectSlugs.length > 0) {
      const related = await prisma.project.findMany({
        where: { slug: { in: relatedProjectSlugs } },
        select: { id: true },
      })
      relatedProjectsConnect = related
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        ...(relatedProjectsConnect.length > 0 && {
          relatedProjects: { connect: relatedProjectsConnect },
        }),
      },
      include: {
        service: true,
        teamMembers: true,
        relatedProjects: { select: { id: true, name: true, slug: true } },
      }
    })

    return successResponse(project, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
