// Public FAQs API - List all active FAQs
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        keywords: true,
        order: true,
      },
    })

    return publicJson(faqs)
  } catch (error) {
    console.error('Public API Error [GET /api/public/faqs]:', error)
    return publicError('Failed to fetch FAQs')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
