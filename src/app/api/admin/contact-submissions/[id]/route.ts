// Admin Contact Submission Detail API - Get, Update, Delete single submission
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSubmissionUpdateSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/admin/contact-submissions/[id] - Get single submission (auto-mark as read)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const submission = await prisma.contactSubmission.findUnique({
      where: { id },
    })

    if (!submission) {
      return errorResponse('Submission not found', 404)
    }

    // Auto-mark as read if currently unread
    if (submission.status === 'unread') {
      await prisma.contactSubmission.update({
        where: { id },
        data: { status: 'read' },
      })
      submission.status = 'read'
    }

    return successResponse(submission)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/contact-submissions/[id] - Update status or admin notes
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedData = contactSubmissionUpdateSchema.parse(body)

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: validatedData,
    })

    return successResponse(submission)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/contact-submissions/[id] - Delete submission
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    await prisma.contactSubmission.delete({
      where: { id },
    })

    return successResponse({ message: 'Submission deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
