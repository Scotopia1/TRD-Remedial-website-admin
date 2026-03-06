// Public Team API - List all team members
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        roles: true,
        expertise: true,
        bio: true,
        image: true,
        blurDataURL: true,
        expertiseLevels: true,
        linkedIn: true,
        joinedYear: true,
        order: true,
      },
    })

    return publicJson(teamMembers)
  } catch (error) {
    console.error('Public API Error [GET /api/public/team]:', error)
    return publicError('Failed to fetch team members')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
