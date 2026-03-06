/**
 * API Type Definitions
 *
 * These interfaces mirror the shapes returned by the admin dashboard's
 * public API endpoints at /api/public/*. They are designed to be fully
 * compatible with the static data interfaces used across components.
 */

// ---------------------------------------------------------------------------
// Service types
// ---------------------------------------------------------------------------

export interface ServiceStat {
  value: string;
  label: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

/** FAQ embedded within a service (distinct from the site-wide FAQItem) */
export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceTestimonial {
  quote: string;
  role: string;
  company: string;
  projectType?: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  benefits: string[];
  icon: string;
  visual: string;
  heroImage?: string;
  featureImage?: string;
  processImage?: string;
  detailPage?: string;
  stats?: ServiceStat[];
  process?: ProcessStep[];
  relatedProjects?: string[];
  // Phase 2 SEO fields
  commonApplications?: string;
  whyChooseTRD?: string;
  serviceArea?: string;
  relatedServices?: string[];
  // Phase 2.5 Q&A and social proof
  faqs?: ServiceFAQ[];
  testimonials?: ServiceTestimonial[];
}

// ---------------------------------------------------------------------------
// Project types
// ---------------------------------------------------------------------------

export interface ProjectImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface ProjectStat {
  value: string;
  label: string;
}

export interface ProjectTestimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface Project {
  // List view
  id: string;
  slug: string;
  name: string;
  location: string;
  date: string;
  serviceType: string;
  serviceId: string;
  category: string[];
  featuredImage: string;
  thumbnailImage: string;

  // Detail view
  tagline: string;
  challenge: string;
  solution: string;
  results: string;
  heroImage: string;

  /** Primary image carousel -- exactly 7 images showing project progress */
  galleryImages: ProjectImage[];

  stats?: ProjectStat[];
  testimonial?: ProjectTestimonial;
  timeline?: string;
  budget?: string;
  teamMembers?: string[];
  relatedProjects?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

// ---------------------------------------------------------------------------
// Team types
// ---------------------------------------------------------------------------

export interface ExpertiseLevel {
  skill: string;
  level: number; // 0-100
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  roles: string[];
  expertise: string[];
  bio: string;
  image: string;
  blurDataURL?: string;
  linkedIn?: string;
  /** Year the member joined the company */
  joinedYear?: string;
  /** Extended expertise with proficiency levels -- added by DB layer */
  expertiseLevels?: ExpertiseLevel[];
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  image?: string;
  isText?: boolean;
}

// ---------------------------------------------------------------------------
// FAQ types (site-wide)
// ---------------------------------------------------------------------------

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'process' | 'technical' | 'services';
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Testimonial (homepage / global)
// ---------------------------------------------------------------------------

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  /** Optional project reference */
  projectSlug?: string;
  /** Optional service reference */
  serviceSlug?: string;
  rating?: number;
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;
  siteTitle: string;
  siteDescription: string;
  companyName: string;
  companyFullName: string;
  tagline: string;
  subTagline: string;
  valueProposition: string;
  emergencyPhone1: string;
  emergencyPhone2: string;
  parentCompanyName: string;
  parentCompanyYear: string;
  socialLinkedIn: string;
  socialFacebook: string;
  socialInstagram: string;
  ogImage: string;
  twitterImage: string;
  footerCta: string;
  footerDescription: string;
  bannerText: string;
  copyrightText: string;
  navigationLinks: Array<{ label: string; href: string }>;
  featuredProjectIds: string[];
  geoLatitude?: number;
  geoLongitude?: number;
}

// ---------------------------------------------------------------------------
// Page content (CMS-style key/value content blocks)
// ---------------------------------------------------------------------------

export interface PageContent {
  id: string;
  page: string;
  key: string;
  value: string;
  type: 'text' | 'html' | 'json' | 'markdown';
  updatedAt?: string;
}
