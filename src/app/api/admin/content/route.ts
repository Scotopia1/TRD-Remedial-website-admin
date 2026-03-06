import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils';

// GET /api/admin/content - List all or filter by page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    const where = page ? { page } : {};

    const contents = await prisma.pageContent.findMany({
      where,
      orderBy: [{ page: 'asc' }, { section: 'asc' }, { order: 'asc' }],
    });

    return successResponse(contents);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/admin/content - Create a content variable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const content = await prisma.pageContent.create({
      data: {
        key: body.key,
        value: body.value,
        type: body.type || 'text',
        page: body.page,
        section: body.section,
        label: body.label,
        description: body.description,
        order: body.order || 0,
      },
    });

    return successResponse(content, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/admin/content - Bulk update content variables
export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return errorResponse('Items must be an array', 400);
    }

    const results = await prisma.$transaction(
      items.map((item: { key: string; value: string }) =>
        prisma.pageContent.update({
          where: { key: item.key },
          data: {
            value: item.value,
            version: { increment: 1 },
            updatedAt: new Date(),
          },
        })
      )
    );

    return successResponse(results);
  } catch (error) {
    return handleApiError(error);
  }
}
