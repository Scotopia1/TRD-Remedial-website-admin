// Public Settings API - Get public site settings
import { prisma } from '@/lib/prisma'
import { publicJson, publicError, handleOptions } from '@/lib/cors'

const SETTINGS_ID = 'main'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: {
        contactEmail: true,
        contactPhone: true,
        contactAddress: true,
        businessHours: true,
        siteTitle: true,
        siteDescription: true,
        companyName: true,
        companyFullName: true,
        tagline: true,
        subTagline: true,
        valueProposition: true,
        emergencyPhone1: true,
        emergencyPhone2: true,
        parentCompanyName: true,
        parentCompanyYear: true,
        socialLinkedIn: true,
        socialFacebook: true,
        socialInstagram: true,
        footerCta: true,
        footerDescription: true,
        bannerText: true,
        copyrightText: true,
        navigationLinks: true,
        featuredProjectIds: true,
        ogImage: true,
        twitterImage: true,
        geoLatitude: true,
        geoLongitude: true,
      },
    })

    if (!settings) {
      return publicError('Settings not found', 404)
    }

    return publicJson(settings)
  } catch (error) {
    console.error('Public API Error [GET /api/public/settings]:', error)
    return publicError('Failed to fetch settings')
  }
}

export async function OPTIONS() {
  return handleOptions()
}
