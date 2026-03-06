/**
 * Site-wide constants and configuration
 */

// Company Information
export const COMPANY_INFO = {
  name: 'TRD Remedial',
  fullName: 'TRD Remedial - The Remedial Experts',
  tagline: 'THE REMEDIAL EXPERTS',
  subTagline: 'When structural problems demand real answers',
  valueProposition: "We solve challenges others can't handle",

  // Contact Details
  contact: {
    phone: {
      emergency1: '0414 727 167',
      emergency2: '0404 404 422',
    },
    email: 'contact@trdremedial.com.au',
    address: '2 Beryl Place Greenacre NSW 2190',
  },

  // Quick access properties
  emergency_phones: ['0414 727 167', '0404 404 422'],
  email: 'contact@trdremedial.com.au',
  address: '2 Beryl Place Greenacre NSW 2190',

  // Parent Company
  parentCompany: {
    name: 'Tension Reinforced Developments',
    established: '2017',
  },
} as const;

// Navigation Links
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

