// API Utilities for consistent error handling and responses
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  )
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error },
    { status }
  )
}

export function validationErrorResponse(zodError: ZodError) {
  const errors: Record<string, string[]> = {}

  zodError.issues.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(err.message)
  })

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: 'Validation failed',
      errors
    },
    { status: 422 }
  )
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return validationErrorResponse(error)
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return errorResponse('A record with this value already exists', 409)
      case 'P2025':
        return errorResponse('Record not found', 404)
      case 'P2003':
        return errorResponse('Related record not found', 400)
      default:
        return errorResponse('Database error occurred', 500)
    }
  }

  // Generic errors
  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('An unexpected error occurred', 500)
}

// Helper to extract ID from URL pathname
export function getIdFromPath(pathname: string): string | null {
  const segments = pathname.split('/')
  const id = segments[segments.length - 1]
  return id && id !== '' ? id : null
}
