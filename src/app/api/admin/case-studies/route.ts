// Case Studies API - List and Create
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { caseStudySchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/case-studies - List all case studies
export async function GET() {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return successResponse(caseStudies)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/admin/case-studies - Create new case study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = caseStudySchema.parse(body)

    const caseStudy = await prisma.caseStudy.create({
      data: validatedData
    })

    return successResponse(caseStudy, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
