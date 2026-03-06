import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

type RouteContext = {
  params: Promise<{ key: string }>;
};

// GET /api/admin/content/[key]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;

    const content = await prisma.pageContent.findUnique({
      where: { key },
      include: { history: { orderBy: { version: 'desc' }, take: 10 } },
    });

    if (!content) {
      return errorResponse('Content not found', 404);
    }

    return successResponse(content);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/content/[key]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;
    const body = await request.json();

    const existing = await prisma.pageContent.findUnique({ where: { key } });
    if (!existing) {
      return errorResponse('Content not found', 404);
    }

    // Create history entry
    await prisma.contentHistory.create({
      data: {
        contentId: existing.id,
        value: existing.value,
        version: existing.version,
        changedBy: body.changedBy || 'admin',
        changeNote: body.changeNote,
      },
    });

    // Update the content
    const updated = await prisma.pageContent.update({
      where: { key },
      data: {
        value: body.value,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/content/[key]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { key } = await context.params;

    const existing = await prisma.pageContent.findUnique({ where: { key } });
    if (!existing) {
      return errorResponse('Content not found', 404);
    }

    // Delete related history records first (foreign key constraint)
    await prisma.contentHistory.deleteMany({ where: { contentId: existing.id } });

    // Delete the content record
    await prisma.pageContent.delete({ where: { key } });

    return successResponse({ message: 'Content deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
