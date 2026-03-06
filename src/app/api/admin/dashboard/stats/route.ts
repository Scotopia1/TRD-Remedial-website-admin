import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      servicesCount,
      projectsCount,
      teamCount,
      faqsCount,
      contentCount,
      mediaCount,
      submissionsCount,
      unreadSubmissionsCount,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.project.count(),
      prisma.teamMember.count(),
      prisma.fAQ.count(),
      prisma.pageContent.count(),
      prisma.media.count(),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { status: 'unread' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        services: servicesCount,
        projects: projectsCount,
        team: teamCount,
        faqs: faqsCount,
        content: contentCount,
        media: mediaCount,
        submissions: submissionsCount,
        unreadSubmissions: unreadSubmissionsCount,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}
