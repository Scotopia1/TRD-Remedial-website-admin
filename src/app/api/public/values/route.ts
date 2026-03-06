// Public Values API - List all company values
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const values = await prisma.companyValue.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        isText: true,
        order: true,
      },
    })

    return publicJson(values)
  } catch (error) {
    console.error('Public API Error [GET /api/public/values]:', error)
    return publicError('Failed to fetch company values')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
