// Projects API - Get, Update, Delete individual project
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { projectUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'
import { triggerRevalidation } from '@/lib/revalidate'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/projects/[id] - Get single project
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        service: true,
        teamMembers: true,
        relatedProjects: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
          }
        }
      }
    })

    if (!project) {
      return errorResponse('Project not found', 404)
    }

    return successResponse(project)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/projects/[id] - Update project
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    // Extract relatedProjectSlugs before schema validation
    const { relatedProjectSlugs, ...rest } = body
    const validatedData = projectUpdateSchema.parse(rest)

    // Resolve related project IDs from slugs and set (replace all)
    let relatedProjectsUpdate: object | undefined
    if (relatedProjectSlugs !== undefined && Array.isArray(relatedProjectSlugs)) {
      const related = relatedProjectSlugs.length > 0
        ? await prisma.project.findMany({
            where: { slug: { in: relatedProjectSlugs } },
            select: { id: true },
          })
        : []
      relatedProjectsUpdate = { set: related }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...validatedData,
        ...(relatedProjectsUpdate !== undefined && { relatedProjects: relatedProjectsUpdate }),
      },
      include: {
        service: true,
        teamMembers: true,
        relatedProjects: { select: { id: true, name: true, slug: true } },
      }
    })

    triggerRevalidation('project', project.slug)

    return successResponse(project)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.project.delete({
      where: { id }
    })

    triggerRevalidation('project')

    return successResponse({ message: 'Project deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
