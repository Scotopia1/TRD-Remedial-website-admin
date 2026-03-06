import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { faqSchema } from '@/lib/validations';

// GET /api/admin/faqs
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    return successResponse(faqs);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/faqs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error?.issues ?? [];
      return errorResponse(issues.map(e => `${e.path.map(String).join('.')}: ${e.message}`).join('; '), 400);
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        category: parsed.data.category,
        keywords: parsed.data.keywords,
        order: parsed.data.order,
        isActive: parsed.data.isActive,
      },
    });

    return successResponse(faq, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
