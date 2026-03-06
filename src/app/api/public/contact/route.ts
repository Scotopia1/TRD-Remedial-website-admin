// Public Contact Form Submission API
// Accepts POST from the TRD website contact form

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSubmissionSchema } from '@/lib/validations'
import { sendContactConfirmation, sendAdminNotification } from '@/lib/email'
import { ZodError } from 'zod'

// CORS headers allowing POST from any origin (consistent with other public routes).
// vercel.json also applies Access-Control-Allow-Origin: * at the edge level for
// all /api/public/* routes, so we must not set a conflicting domain-specific origin
// here -- duplicate origins cause browsers to reject the request.
const CONTACT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

// OPTIONS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CONTACT_CORS_HEADERS,
  })
}

// POST /api/public/contact - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate form data
    const validatedData = contactSubmissionSchema.parse(body)

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: validatedData,
    })

    // Fire-and-forget: send emails without blocking the response
    sendContactConfirmation(submission.email, submission.name).catch(() => {})
    sendAdminNotification({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      company: submission.company,
      serviceInterest: submission.serviceInterest,
      projectType: submission.projectType,
      message: submission.message,
      createdAt: submission.createdAt,
    }).catch(() => {})

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 201, headers: CONTACT_CORS_HEADERS }
    )
  } catch (error) {
    // Zod validation error
    if (error instanceof ZodError) {
      const errors: Record<string, string[]> = {}
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        if (!errors[path]) errors[path] = []
        errors[path].push(issue.message)
      })

      return NextResponse.json(
        { success: false, error: 'Validation failed', errors },
        { status: 422, headers: CONTACT_CORS_HEADERS }
      )
    }

    console.error('Public API Error [POST /api/public/contact]:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500, headers: CONTACT_CORS_HEADERS }
    )
  }
}
