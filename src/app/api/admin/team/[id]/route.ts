// Team Members API - Get, Update, Delete individual team member
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { teamMemberUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/team/[id] - Get single team member
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
            serviceType: true,
          }
        }
      }
    })

    if (!teamMember) {
      return errorResponse('Team member not found', 404)
    }

    return successResponse(teamMember)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/team/[id] - Update team member
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = teamMemberUpdateSchema.parse(body)

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: validatedData,
      include: {
        projects: true
      }
    })

    return successResponse(teamMember)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/team/[id] - Delete team member
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    // Check if team member has projects
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!teamMember) {
      return errorResponse('Team member not found', 404)
    }

    if (teamMember._count.projects > 0) {
      return errorResponse(
        `Cannot delete team member with ${teamMember._count.projects} associated projects`,
        400
      )
    }

    await prisma.teamMember.delete({
      where: { id }
    })

    return successResponse({ message: 'Team member deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
