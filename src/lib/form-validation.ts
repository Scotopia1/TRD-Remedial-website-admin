/**
 * Client-side form validation utilities for admin dashboard forms.
 *
 * Character limits:
 * - Name/Title: 100
 * - Slug: 80
 * - Short description / Tagline: 200
 * - Meta title: 60
 * - Meta description: 160
 * - Long text (bio, challenge, solution, results, description): 2000
 * - Quote (testimonial): 500
 * - Email: 254
 * - Phone: 20
 * - URL fields: 500
 * - Keywords/tags: 50 per item
 */

// ─── Character Limits ────────────────────────────────────────────────────────

export const CHAR_LIMITS = {
  name: 100,
  title: 100,
  slug: 80,
  shortDescription: 200,
  tagline: 200,
  metaTitle: 60,
  metaDescription: 160,
  longText: 2000,
  quote: 500,
  email: 254,
  phone: 20,
  url: 500,
  keyword: 50,
} as const;

// ─── Validation Patterns ─────────────────────────────────────────────────────

export const PATTERNS = {
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s\-().]{7,20}$/,
  url: /^(https?:\/\/|\/)[^\s]*$/,
} as const;

// ─── Validation Messages ─────────────────────────────────────────────────────

export const MESSAGES = {
  required: 'This field is required',
  maxLength: (max: number) => `Must be ${max} characters or fewer`,
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  slug: 'Slug can only contain lowercase letters, numbers, and hyphens',
  phone: 'Please enter a valid phone number',
} as const;

// ─── Help Text ───────────────────────────────────────────────────────────────

export const HELP_TEXT = {
  slug: "URL-friendly identifier (e.g., 'concrete-repairs'). Auto-generated from name.",
  metaTitle: 'Appears in browser tab and search results. Optimal: 50-60 characters.',
  metaDescription: 'Shown in Google search results. Optimal: 120-160 characters.',
  shortDescription: 'Brief summary shown on listing cards.',
  heroImage: 'Main banner image. Recommended: 1920x1080px or larger.',
  ogImage: 'Image shown when shared on social media. Recommended: 1200x630px.',
} as const;

// ─── Slug Generation ─────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── react-hook-form Validation Rules ────────────────────────────────────────

export function requiredMaxLength(max: number) {
  return {
    required: MESSAGES.required,
    maxLength: { value: max, message: MESSAGES.maxLength(max) },
  };
}

export function optionalMaxLength(max: number) {
  return {
    maxLength: { value: max, message: MESSAGES.maxLength(max) },
  };
}

export function slugRules() {
  return {
    required: MESSAGES.required,
    maxLength: { value: CHAR_LIMITS.slug, message: MESSAGES.maxLength(CHAR_LIMITS.slug) },
    pattern: { value: PATTERNS.slug, message: MESSAGES.slug },
  };
}

export function emailRules(isRequired = true) {
  return {
    ...(isRequired ? { required: MESSAGES.required } : {}),
    maxLength: { value: CHAR_LIMITS.email, message: MESSAGES.maxLength(CHAR_LIMITS.email) },
    pattern: { value: PATTERNS.email, message: MESSAGES.email },
  };
}

export function phoneRules(isRequired = false) {
  return {
    ...(isRequired ? { required: MESSAGES.required } : {}),
    maxLength: { value: CHAR_LIMITS.phone, message: MESSAGES.maxLength(CHAR_LIMITS.phone) },
    pattern: { value: PATTERNS.phone, message: MESSAGES.phone },
  };
}

export function urlRules(isRequired = false) {
  return {
    ...(isRequired ? { required: MESSAGES.required } : {}),
    maxLength: { value: CHAR_LIMITS.url, message: MESSAGES.maxLength(CHAR_LIMITS.url) },
  };
}

// ─── Input class helpers ─────────────────────────────────────────────────────

const BASE_INPUT = 'w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2';

export function inputClass(hasError?: boolean) {
  return `${BASE_INPUT} ${hasError ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-300'}`;
}
