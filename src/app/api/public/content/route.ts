// Public Content API - List page content entries
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')

    const where = page ? { page, isDraft: false } : { isDraft: false }

    const contents = await prisma.pageContent.findMany({
      where,
      orderBy: [{ page: 'asc' }, { section: 'asc' }, { order: 'asc' }],
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

    return publicJson(contents)
  } catch (error) {
    console.error('Public API Error [GET /api/public/content]:', error)
    return publicError('Failed to fetch content')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
