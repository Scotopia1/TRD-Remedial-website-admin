// Site Settings API - Get and Update (Singleton)
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { siteSettingsUpdateSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-utils'

const SETTINGS_ID = 'main'

// GET /api/admin/settings - Get site settings
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID }
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: SETTINGS_ID,
          contactEmail: 'contact@trd.com',
          contactPhone: '+1 (555) 000-0000',
          contactAddress: '123 Main Street, City, Country',
          businessHours: 'Mon-Fri: 9AM-5PM',
          siteTitle: 'TRD - Technical Resource Development',
          siteDescription: 'Leading provider of technical resource development solutions',
        }
      })
    }

    return successResponse(settings)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/settings - Update site settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = siteSettingsUpdateSchema.parse(body)

    // Ensure settings exist before updating
    let settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID }
    })

    if (!settings) {
      // Create with provided data
      settings = await prisma.siteSettings.create({
        data: {
          id: SETTINGS_ID,
          contactEmail: 'contact@trd.com',
          contactPhone: '+1 (555) 000-0000',
          contactAddress: '123 Main Street, City, Country',
          businessHours: 'Mon-Fri: 9AM-5PM',
          siteTitle: 'TRD - Technical Resource Development',
          siteDescription: 'Leading provider of technical resource development solutions',
          ...validatedData
        }
      })
    } else {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: SETTINGS_ID },
        data: validatedData
      })
    }

    return successResponse(settings)
  } catch (error) {
    return handleApiError(error)
  }
}
