// Team Members API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { teamMemberSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/team - List all team members
export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            featuredImage: true,
          }
        },
        _count: {
          select: {
            projects: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return successResponse(teamMembers)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/team - Create new team member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = teamMemberSchema.parse(body)

    const teamMember = await prisma.teamMember.create({
      data: validatedData,
      include: {
        projects: true
      }
    })

    return successResponse(teamMember, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
