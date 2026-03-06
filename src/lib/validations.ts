// Zod Validation Schemas for Admin API
import { z } from 'zod'

// Helper: accepts either a URL or a relative path starting with /
const urlOrPath = z.string().min(1)
const optionalUrlOrPath = z.string().optional()

// Service validation schema
export const serviceSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()),
  benefits: z.array(z.string()),
  icon: urlOrPath,
  visual: urlOrPath,
  heroImage: optionalUrlOrPath,
  featureImage: optionalUrlOrPath,
  processImage: optionalUrlOrPath,
  stats: z.any().optional(),
  process: z.any().optional(),
  // Phase 2 fields
  commonApplications: z.string().optional(),
  whyChooseTRD: z.string().optional(),
  serviceArea: z.string().optional(),
  relatedServiceSlugs: z.array(z.string()).optional(),
  faqs: z.any().optional(),
  testimonials: z.any().optional(),
  detailPage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const serviceUpdateSchema = serviceSchema.partial()

// Project validation schema
export const projectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1),
  location: z.string().min(1),
  date: z.string().min(1),
  serviceType: z.string().min(1),
  serviceId: z.string().min(1),
  categories: z.array(z.string()),
  featuredImage: urlOrPath,
  thumbnailImage: urlOrPath,
  heroImage: urlOrPath,
  tagline: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.string().min(1),
  results: z.string().min(1),
  beforeImage: z.any().optional(),
  afterImage: z.any().optional(),
  galleryImages: z.any().optional(),
  stats: z.any().optional(),
  testimonial: z.any().optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const projectUpdateSchema = projectSchema.partial()

// TeamMember validation schema
export const teamMemberSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  roles: z.array(z.string()),
  expertise: z.array(z.string()),
  bio: z.string().min(1),
  image: urlOrPath,
  linkedIn: z.string().optional(),
  order: z.number().int().min(0).default(0),
  blurDataURL: z.string().optional(),
})

export const teamMemberUpdateSchema = teamMemberSchema.partial()

// CompanyValue validation schema
export const companyValueSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  image: optionalUrlOrPath,
  isText: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const companyValueUpdateSchema = companyValueSchema.partial()

// CaseStudy validation schema
export const caseStudySchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.array(z.string()),
  result: z.string().min(1),
  metrics: z.any().optional(),
  images: z.any().optional(),
  visual: z.string().optional(),
})

export const caseStudyUpdateSchema = caseStudySchema.partial()

// SiteSettings validation schema
export const siteSettingsSchema = z.object({
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  contactAddress: z.string().min(1),
  businessHours: z.string().min(1),
  siteTitle: z.string().min(1),
  siteDescription: z.string().min(1),
  companyName: z.string().optional().nullable(),
  companyFullName: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  subTagline: z.string().optional().nullable(),
  valueProposition: z.string().optional().nullable(),
  emergencyPhone1: z.string().optional().nullable(),
  emergencyPhone2: z.string().optional().nullable(),
  parentCompanyName: z.string().optional().nullable(),
  parentCompanyYear: z.string().optional().nullable(),
  socialLinkedIn: z.string().optional().nullable(),
  socialFacebook: z.string().optional().nullable(),
  socialInstagram: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  twitterImage: z.string().optional().nullable(),
  footerCta: z.string().optional().nullable(),
  footerDescription: z.string().optional().nullable(),
  bannerText: z.string().optional().nullable(),
  copyrightText: z.string().optional().nullable(),
  navigationLinks: z.any().optional(),
})

export const siteSettingsUpdateSchema = siteSettingsSchema.partial()

// Media validation schema
export const mediaSchema = z.object({
  filename: z.string().min(1),
  url: urlOrPath,
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const mediaUpdateSchema = mediaSchema.partial()

// Page Content validation schema
export const pageContentSchema = z.object({
  key: z.string().min(1).regex(/^[a-z0-9._-]+$/, 'Key must be dot-notation lowercase'),
  value: z.string(),
  type: z.enum(['text', 'html', 'image', 'json']).default('text'),
  page: z.string().min(1),
  section: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
})

export const pageContentUpdateSchema = pageContentSchema.partial()

// FAQ validation schema
export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(10),
  category: z.enum(['process', 'technical', 'services']),
  keywords: z.array(z.string()),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const faqUpdateSchema = faqSchema.partial()

// Testimonial validation schema
export const testimonialSchema = z.object({
  quote: z.string().min(10),
  author: z.string().min(1),
  role: z.string().min(1),
  company: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const testimonialUpdateSchema = testimonialSchema.partial()

// Contact Submission validation schema (public form)
export const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  serviceInterest: z.string().optional(),
  projectType: z.string().optional(),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

// Contact Submission admin update schema
export const contactSubmissionUpdateSchema = z.object({
  status: z.enum(['unread', 'read', 'replied']).optional(),
  adminNotes: z.string().optional().nullable(),
})
