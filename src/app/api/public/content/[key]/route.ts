// Public Content API - Get single content entry by key
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

type RouteContext = {
  params: Promise<{ key: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params

    const content = await prisma.pageContent.findUnique({
      where: { key },
      select: {
        id: true,
        key: true,
        value: true,
        type: true,
        page: true,
        section: true,
        label: true,
        order: true,
      },
    })

    if (!content) {
      return publicError('Content not found', 404)
    }

    return publicJson(content)
  } catch (error) {
    console.error('Public API Error [GET /api/public/content/[key]]:', error)
    return publicError('Failed to fetch content')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
