import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';
import { triggerRevalidation } from '@/lib/revalidate';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/faqs/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const faq = await prisma.fAQ.findUnique({ where: { id } });

    if (!faq) {
      return errorResponse('FAQ not found', 404);
    }

    return successResponse(faq);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/admin/faqs/[id]
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const faq = await prisma.fAQ.update({
      where: { id },
      data: body,
    });

    triggerRevalidation('faqs');

    return successResponse(faq);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/faqs/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.fAQ.delete({ where: { id } });

    triggerRevalidation('faqs');

    return successResponse({ message: 'FAQ deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
