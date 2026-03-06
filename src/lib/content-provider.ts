// Content Provider - Database-first data access layer
// Reads from PostgreSQL via Prisma. Returns empty results when the database
// is unavailable (no static file fallback -- all data lives in the DB now).

import { prisma } from '@/lib/prisma';
import { COMPANY_INFO } from '@/lib/constants';

import type { Service } from '@/types/api';
import type { Project } from '@/types/api';
import type { TeamMember, CompanyValue } from '@/types/api';
import type { FAQItem } from '@/types/api';

// ===== PAGE CONTENT =====

export async function getPageContent(page: string): Promise<Record<string, string>> {
  try {
    const contents = await prisma.pageContent.findMany({
      where: { page, isDraft: false },
    });
    if (contents.length > 0) {
      return Object.fromEntries(contents.map((c) => [c.key, c.value]));
    }
  } catch {
    // Database not available, fall through
  }
  return {};
}

export async function getContentValue(key: string, fallback: string = ''): Promise<string> {
  try {
    const content = await prisma.pageContent.findUnique({
      where: { key },
    });
    if (content) return content.value;
  } catch {
    // Database not available
  }
  return fallback;
}

// ===== SERVICES =====

export async function getServices(): Promise<Service[]> {
  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { projects: { select: { id: true, slug: true, name: true } } },
    });
    if (dbServices.length > 0) {
      return dbServices.map((s) => ({
        id: s.slug,
        slug: s.slug,
        title: s.title,
        tagline: s.tagline,
        description: s.description,
        features: s.features,
        benefits: s.benefits,
        icon: s.icon,
        visual: s.visual,
        heroImage: s.heroImage || undefined,
        featureImage: s.featureImage || undefined,
        processImage: s.processImage || undefined,
        stats: s.stats as unknown as Service['stats'],
        process: s.process as unknown as Service['process'],
        commonApplications: s.commonApplications || undefined,
        whyChooseTRD: s.whyChooseTRD || undefined,
        serviceArea: s.serviceArea || undefined,
        relatedServices: s.relatedServiceSlugs || undefined,
        faqs: s.faqs as unknown as Service['faqs'],
        testimonials: s.testimonials as unknown as Service['testimonials'],
        relatedProjects: s.projects.map((p) => p.slug),
      }));
    }
  } catch {
    // Database not available
  }
  return [];
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const s = await prisma.service.findUnique({
      where: { slug },
      include: { projects: { select: { id: true, slug: true, name: true } } },
    });
    if (s) {
      return {
        id: s.slug,
        slug: s.slug,
        title: s.title,
        tagline: s.tagline,
        description: s.description,
        features: s.features,
        benefits: s.benefits,
        icon: s.icon,
        visual: s.visual,
        heroImage: s.heroImage || undefined,
        featureImage: s.featureImage || undefined,
        processImage: s.processImage || undefined,
        stats: s.stats as unknown as Service['stats'],
        process: s.process as unknown as Service['process'],
        commonApplications: s.commonApplications || undefined,
        whyChooseTRD: s.whyChooseTRD || undefined,
        serviceArea: s.serviceArea || undefined,
        relatedServices: s.relatedServiceSlugs || undefined,
        faqs: s.faqs as unknown as Service['faqs'],
        testimonials: s.testimonials as unknown as Service['testimonials'],
        relatedProjects: s.projects.map((p) => p.slug),
      };
    }
  } catch {
    // Database not available
  }
  return null;
}

// ===== PROJECTS =====

export async function getProjects(): Promise<Project[]> {
  try {
    const dbProjects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    if (dbProjects.length > 0) {
      return dbProjects.map((p) => ({
        id: p.slug,
        slug: p.slug,
        name: p.name,
        location: p.location,
        date: p.date,
        serviceType: p.serviceType,
        serviceId: p.serviceId,
        category: p.categories,
        featuredImage: p.featuredImage,
        thumbnailImage: p.thumbnailImage,
        heroImage: p.heroImage,
        tagline: p.tagline,
        challenge: p.challenge,
        solution: p.solution,
        results: p.results,
        galleryImages: (p.galleryImages as unknown as Project['galleryImages']) || [],
        stats: p.stats as unknown as Project['stats'],
        testimonial: p.testimonial as unknown as Project['testimonial'],
        timeline: p.timeline || undefined,
        budget: p.budget || undefined,
        metaTitle: p.metaTitle || undefined,
        metaDescription: p.metaDescription || undefined,
      }));
    }
  } catch {
    // Database not available
  }
  return [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const p = await prisma.project.findUnique({ where: { slug } });
    if (p) {
      return {
        id: p.slug,
        slug: p.slug,
        name: p.name,
        location: p.location,
        date: p.date,
        serviceType: p.serviceType,
        serviceId: p.serviceId,
        category: p.categories,
        featuredImage: p.featuredImage,
        thumbnailImage: p.thumbnailImage,
        heroImage: p.heroImage,
        tagline: p.tagline,
        challenge: p.challenge,
        solution: p.solution,
        results: p.results,
        galleryImages: (p.galleryImages as unknown as Project['galleryImages']) || [],
        stats: p.stats as unknown as Project['stats'],
        testimonial: p.testimonial as unknown as Project['testimonial'],
        timeline: p.timeline || undefined,
        budget: p.budget || undefined,
        metaTitle: p.metaTitle || undefined,
        metaDescription: p.metaDescription || undefined,
      };
    }
  } catch {
    // Database not available
  }
  return null;
}

// ===== TEAM MEMBERS =====

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const dbMembers = await prisma.teamMember.findMany({
      orderBy: { createdAt: 'asc' },
    });
    if (dbMembers.length > 0) {
      return dbMembers.map((m) => ({
        id: m.id,
        name: m.name,
        title: m.title,
        roles: m.roles,
        expertise: m.expertise,
        bio: m.bio,
        image: m.image,
        linkedIn: m.linkedIn || undefined,
      }));
    }
  } catch {
    // Database not available
  }
  return [];
}

// ===== COMPANY VALUES =====

export async function getCompanyValues(): Promise<CompanyValue[]> {
  try {
    const dbValues = await prisma.companyValue.findMany({
      orderBy: { order: 'asc' },
    });
    if (dbValues.length > 0) {
      return dbValues.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        image: v.image || undefined,
        isText: v.isText,
      }));
    }
  } catch {
    // Database not available
  }
  return [];
}

// ===== FAQS =====

export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const dbFaqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
    if (dbFaqs.length > 0) {
      return dbFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        category: f.category as FAQItem['category'],
        keywords: f.keywords,
      }));
    }
  } catch {
    // Database not available
  }
  return [];
}

// ===== SITE SETTINGS =====

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    });
    if (settings) {
      return {
        name: settings.companyName || COMPANY_INFO.name,
        fullName: settings.companyFullName || COMPANY_INFO.fullName,
        tagline: settings.tagline || COMPANY_INFO.tagline,
        subTagline: settings.subTagline || COMPANY_INFO.subTagline,
        valueProposition: settings.valueProposition || COMPANY_INFO.valueProposition,
        contact: {
          phone: {
            emergency1: settings.emergencyPhone1 || COMPANY_INFO.contact.phone.emergency1,
            emergency2: settings.emergencyPhone2 || COMPANY_INFO.contact.phone.emergency2,
          },
          email: settings.contactEmail || COMPANY_INFO.email,
          address: settings.contactAddress || COMPANY_INFO.address,
        },
        email: settings.contactEmail || COMPANY_INFO.email,
        address: settings.contactAddress || COMPANY_INFO.address,
        emergency_phones: [
          settings.emergencyPhone1 || COMPANY_INFO.emergency_phones[0],
          settings.emergencyPhone2 || COMPANY_INFO.emergency_phones[1],
        ] as readonly string[],
        parentCompany: {
          name: settings.parentCompanyName || COMPANY_INFO.parentCompany.name,
          established: settings.parentCompanyYear || COMPANY_INFO.parentCompany.established,
        },
      };
    }
  } catch {
    // Database not available
  }
  return COMPANY_INFO;
}
