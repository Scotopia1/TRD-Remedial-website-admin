import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DefaultContentItem {
  key: string;
  value: string;
  type: string;
  page: string;
  section: string;
  label: string;
  description?: string;
  order: number;
}

const DEFAULT_CONTENT: DefaultContentItem[] = [
  // ----------------------------------------------------------------
  // HOMEPAGE
  // ----------------------------------------------------------------
  {
    key: 'homepage.hero.heading',
    value: 'THE REMEDIAL EXPERTS',
    type: 'text',
    page: 'homepage',
    section: 'hero',
    label: 'Hero Heading',
    description: 'Main headline displayed in the hero section',
    order: 1,
  },
  {
    key: 'homepage.hero.subheading',
    value: 'When structural problems demand real answers',
    type: 'text',
    page: 'homepage',
    section: 'hero',
    label: 'Hero Subheading',
    description: 'Secondary text beneath the hero heading',
    order: 2,
  },
  {
    key: 'homepage.intro.heading',
    value: 'Why TRD Remedial?',
    type: 'text',
    page: 'homepage',
    section: 'intro',
    label: 'Intro Heading',
    description: 'Heading for the introduction / stats section',
    order: 1,
  },
  {
    key: 'homepage.intro.body',
    value:
      'TRD Remedial is a specialist structural remediation company based in Sydney, NSW. We diagnose and repair concrete spalling, waterproofing failures, structural cracks, and post-tension slab issues across residential, commercial, and civil assets.',
    type: 'textarea',
    page: 'homepage',
    section: 'intro',
    label: 'Intro Body',
    description: 'Paragraph text in the IntroStats / introduction section',
    order: 2,
  },
  {
    key: 'homepage.backed.mission',
    value:
      'Our mission is to deliver long-lasting structural solutions with precision, transparency, and respect for every client\'s property. Every project we undertake is backed by technical expertise and a commitment to doing things right the first time.',
    type: 'textarea',
    page: 'homepage',
    section: 'backed',
    label: 'Mission Statement',
    description: 'Mission paragraph in the BackedByStrengthStudio section',
    order: 1,
  },
  {
    key: 'homepage.backed.recognition',
    value:
      'Recognised by engineers, builders, and strata managers across Greater Sydney for our methodical approach and consistent results on complex remediation projects.',
    type: 'textarea',
    page: 'homepage',
    section: 'backed',
    label: 'Recognition Text',
    description: 'Recognition / credibility paragraph in the BackedByStrengthStudio section',
    order: 2,
  },

  // ----------------------------------------------------------------
  // ABOUT PAGE
  // ----------------------------------------------------------------
  {
    key: 'about.meta.documentType',
    value: 'COMPANY PROFILE',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Document Type',
    description: 'Blueprint-style document type label',
    order: 1,
  },
  {
    key: 'about.meta.subject',
    value: 'TRD REMEDIAL PTY LTD',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Subject',
    description: 'Subject field in the blueprint meta panel',
    order: 2,
  },
  {
    key: 'about.meta.location',
    value: 'SYDNEY, NSW, AUSTRALIA',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Location',
    description: 'Location field in the blueprint meta panel',
    order: 3,
  },
  {
    key: 'about.meta.established',
    value: '2018',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Established Year',
    description: 'Year the company was established',
    order: 4,
  },
  {
    key: 'about.meta.status',
    value: 'ACTIVE',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Status',
    description: 'Company status field in the blueprint meta panel',
    order: 5,
  },
  {
    key: 'about.meta.clearance',
    value: 'STRUCTURAL EXPERTS',
    type: 'text',
    page: 'about',
    section: 'meta',
    label: 'Clearance',
    description: 'Clearance / specialisation tag in the blueprint meta panel',
    order: 6,
  },
  {
    key: 'about.evidence.image1',
    value: '/images/projects/caringbah-pavilion/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 1',
    description: 'First evidence / project image shown on the About page',
    order: 1,
  },
  {
    key: 'about.evidence.image2',
    value: '/images/projects/pelican-road-schofields/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 2',
    description: 'Second evidence / project image shown on the About page',
    order: 2,
  },
  {
    key: 'about.evidence.image3',
    value: '/images/projects/northbridge-structural-wall/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 3',
    description: 'Third evidence / project image shown on the About page',
    order: 3,
  },
  {
    key: 'about.company.description',
    value:
      'TRD Remedial was founded in 2018 by a team of structural engineers and remediation specialists who saw a gap in the market for honest, technically rigorous repair work. From concrete cancer to waterproofing failures, we tackle the problems that others avoid.',
    type: 'textarea',
    page: 'about',
    section: 'company',
    label: 'Company Description',
    description: 'Main company description paragraph on the About page',
    order: 1,
  },
  {
    key: 'about.company.quote',
    value:
      '"We don\'t sell band-aid solutions. We find the root cause and we fix it — properly, permanently, and with the documentation to prove it."',
    type: 'textarea',
    page: 'about',
    section: 'company',
    label: 'Company Quote',
    description: 'Pull-quote or highlighted statement on the About page',
    order: 2,
  },

  // ----------------------------------------------------------------
  // GLOBAL — STATS
  // ----------------------------------------------------------------
  {
    key: 'stats.company',
    value: JSON.stringify(
      [
        { value: '250', suffix: '+', label: 'Projects Completed', sublabel: 'Sydney & surrounds' },
        { value: '98', suffix: '%', label: 'Client Satisfaction', sublabel: 'Independent surveys' },
        { value: '7', suffix: '+', label: 'Years Experience', sublabel: 'Since 2018' },
        { value: '15', suffix: '+', label: 'Expert Technicians', sublabel: 'Licensed & insured' },
      ],
      null,
      2
    ),
    type: 'json',
    page: 'global',
    section: 'stats',
    label: 'Company Stats',
    description: 'JSON array of {value, suffix, label, sublabel} shown in the stats strip',
    order: 1,
  },
  {
    key: 'stats.dataStream',
    value: JSON.stringify(
      [
        { key: 'PROJECTS', value: '250+' },
        { key: 'SATISFACTION', value: '98%' },
        { key: 'YEARS', value: '7+' },
        { key: 'TECHNICIANS', value: '15+' },
        { key: 'STATES', value: 'NSW' },
      ],
      null,
      2
    ),
    type: 'json',
    page: 'global',
    section: 'stats',
    label: 'Data Stream Stats',
    description: 'JSON array of {key, value} used in the scrolling data stream ticker',
    order: 2,
  },

  // ----------------------------------------------------------------
  // GLOBAL — FOOTER
  // ----------------------------------------------------------------
  {
    key: 'footer.cta.heading',
    value: "Let's Build Together",
    type: 'text',
    page: 'global',
    section: 'footer',
    label: 'Footer CTA Heading',
    description: 'Heading in the footer call-to-action strip',
    order: 1,
  },
  {
    key: 'footer.cta.description',
    value:
      'From structural remediation to preventative maintenance, TRD Remedial delivers solutions built to last. Contact us today for an obligation-free assessment.',
    type: 'textarea',
    page: 'global',
    section: 'footer',
    label: 'Footer CTA Description',
    description: 'Description paragraph in the footer call-to-action strip',
    order: 2,
  },
  {
    key: 'footer.copyright',
    value: '© TRD Remedial 2025',
    type: 'text',
    page: 'global',
    section: 'footer',
    label: 'Copyright Text',
    description: 'Copyright notice displayed at the bottom of the footer',
    order: 3,
  },

  // ----------------------------------------------------------------
  // CONTACT PAGE
  // ----------------------------------------------------------------
  {
    key: 'contact.hours.weekday',
    value: 'Mon–Fri: 7:00 AM – 6:00 PM',
    type: 'text',
    page: 'contact',
    section: 'hours',
    label: 'Weekday Hours',
    description: 'Office hours Monday to Friday',
    order: 1,
  },
  {
    key: 'contact.hours.saturday',
    value: 'Sat: 8:00 AM – 2:00 PM',
    type: 'text',
    page: 'contact',
    section: 'hours',
    label: 'Saturday Hours',
    description: 'Office hours on Saturday',
    order: 2,
  },
  {
    key: 'contact.hours.emergency',
    value: '24/7 Emergency Service',
    type: 'text',
    page: 'contact',
    section: 'hours',
    label: 'Emergency Hours',
    description: 'Emergency availability label shown on the Contact page',
    order: 3,
  },
  {
    key: 'contact.business-hours',
    value: 'Mon-Fri: 7:00 AM - 6:00 PM, Sat: 8:00 AM - 2:00 PM, 24/7 Emergency Service',
    type: 'text',
    page: 'contact',
    section: 'info',
    label: 'Business Hours (combined)',
    description: 'Single-line combined business hours string for the contact page info block',
    order: 4,
  },

  // ----------------------------------------------------------------
  // ABOUT PAGE — DOC_META_LINES (typewriter hero lines)
  // ----------------------------------------------------------------
  {
    key: 'about.doc-meta.1',
    value: 'DOCUMENT TYPE:   COMPANY PROFILE',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 1 — Document Type',
    description: 'Typewriter line 1: label + value for DOCUMENT TYPE field',
    order: 1,
  },
  {
    key: 'about.doc-meta.2',
    value: 'SUBJECT:         TRD REMEDIAL PTY LTD',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 2 — Subject',
    description: 'Typewriter line 2: label + value for SUBJECT field',
    order: 2,
  },
  {
    key: 'about.doc-meta.3',
    value: 'LOCATION:        SYDNEY, NSW, AUSTRALIA',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 3 — Location',
    description: 'Typewriter line 3: label + value for LOCATION field',
    order: 3,
  },
  {
    key: 'about.doc-meta.4',
    value: 'ESTABLISHED:     2018',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 4 — Established',
    description: 'Typewriter line 4: label + value for ESTABLISHED field',
    order: 4,
  },
  {
    key: 'about.doc-meta.5',
    value: 'STATUS:          ACTIVE',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 5 — Status',
    description: 'Typewriter line 5: label + value for STATUS field (redacted on page)',
    order: 5,
  },
  {
    key: 'about.doc-meta.6',
    value: 'CLEARANCE:       STRUCTURAL EXPERTS',
    type: 'text',
    page: 'about',
    section: 'doc-meta',
    label: 'Doc Meta Line 6 — Clearance',
    description: 'Typewriter line 6: label + value for CLEARANCE field',
    order: 6,
  },

  // ----------------------------------------------------------------
  // ABOUT PAGE — EVIDENCE_IMAGES (plain image paths)
  // ----------------------------------------------------------------
  {
    key: 'about.evidence-image.1',
    value: '/images/projects/caringbah-pavilion/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 1 — Caringbah Pavilion',
    description: 'First project evidence image: Caringbah Pavilion structural remediation',
    order: 1,
  },
  {
    key: 'about.evidence-image.2',
    value: '/images/projects/pelican-road-schofields/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 2 — Pelican Road Schofields',
    description: 'Second project evidence image: Pelican Road Schofields carbon fibre reinforcement',
    order: 2,
  },
  {
    key: 'about.evidence-image.3',
    value: '/images/projects/northbridge-structural-wall/featured.jpg',
    type: 'image',
    page: 'about',
    section: 'evidence',
    label: 'Evidence Image 3 — Northbridge Structural Wall',
    description: 'Third project evidence image: Northbridge structural wall repair works',
    order: 3,
  },

  // ----------------------------------------------------------------
  // ABOUT PAGE — FILE_IDS (personnel dossier badges)
  // ----------------------------------------------------------------
  {
    key: 'about.file-id.1',
    value: 'CN-001',
    type: 'text',
    page: 'about',
    section: 'file-ids',
    label: 'Personnel File ID 1',
    description: 'File ID badge displayed on the first PersonnelCard (team member 1)',
    order: 1,
  },
  {
    key: 'about.file-id.2',
    value: 'CN-002',
    type: 'text',
    page: 'about',
    section: 'file-ids',
    label: 'Personnel File ID 2',
    description: 'File ID badge displayed on the second PersonnelCard (team member 2)',
    order: 2,
  },
  {
    key: 'about.file-id.3',
    value: 'FN-001',
    type: 'text',
    page: 'about',
    section: 'file-ids',
    label: 'Personnel File ID 3',
    description: 'File ID badge displayed on the third PersonnelCard (team member 3)',
    order: 3,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — IntroStats section
  // ----------------------------------------------------------------
  {
    key: 'home.intro.link-text',
    value: 'Learn more about our approach \u2192',
    type: 'text',
    page: 'home',
    section: 'intro',
    label: 'Intro Link Text',
    description: 'Link text below the intro body copy',
    order: 3,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — Hero (tagline words + CTA + media)
  // ----------------------------------------------------------------
  {
    key: 'home.hero.tagline.1',
    value: 'THE',
    type: 'text',
    page: 'home',
    section: 'hero',
    label: 'Hero Tagline Word 1',
    description: 'First animated word in the hero h1 tagline',
    order: 1,
  },
  {
    key: 'home.hero.tagline.2',
    value: 'REMEDIAL',
    type: 'text',
    page: 'home',
    section: 'hero',
    label: 'Hero Tagline Word 2',
    description: 'Second animated word in the hero h1 tagline',
    order: 2,
  },
  {
    key: 'home.hero.tagline.3',
    value: 'EXPERTS',
    type: 'text',
    page: 'home',
    section: 'hero',
    label: 'Hero Tagline Word 3',
    description: 'Third animated word in the hero h1 tagline',
    order: 3,
  },
  {
    key: 'home.hero.cta',
    value: 'EXPLORE OUR SERVICES',
    type: 'text',
    page: 'home',
    section: 'hero',
    label: 'Hero CTA Text',
    description: 'Text on the circular button in the hero section (links to /services)',
    order: 4,
  },
  {
    key: 'home.hero.video',
    value: '/videos/hero-video',
    type: 'text',
    page: 'home',
    section: 'hero',
    label: 'Hero Video Path',
    description: 'Path to the hero background video (without extension — served as .mp4 / .webm)',
    order: 5,
  },
  {
    key: 'home.hero.poster',
    value: '/videos/hero-poster.webp',
    type: 'image',
    page: 'home',
    section: 'hero',
    label: 'Hero Video Poster',
    description: 'Poster image shown while the hero video is loading',
    order: 6,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — ServicesSpotlight (intro words)
  // ----------------------------------------------------------------
  {
    key: 'home.services.intro-word-1',
    value: 'Innovative',
    type: 'text',
    page: 'home',
    section: 'services',
    label: 'Services Intro Word 1',
    description: 'First large word displayed during ServicesSpotlight Phase 1 animation',
    order: 1,
  },
  {
    key: 'home.services.intro-word-2',
    value: 'Solutions',
    type: 'text',
    page: 'home',
    section: 'services',
    label: 'Services Intro Word 2',
    description: 'Second large word displayed during ServicesSpotlight Phase 1 animation',
    order: 2,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — CaseStudiesOtisValen (header text)
  // ----------------------------------------------------------------
  {
    key: 'home.case-studies.eyebrow',
    value: 'Proven Results, Real Projects',
    type: 'text',
    page: 'home',
    section: 'case-studies',
    label: 'Case Studies Eyebrow',
    description: 'Eyebrow text above the Case Studies title',
    order: 2,
  },
  {
    key: 'home.case-studies.title',
    value: 'Case Studies',
    type: 'text',
    page: 'home',
    section: 'case-studies',
    label: 'Case Studies Title',
    description: 'Main heading for the Case Studies section',
    order: 3,
  },
  {
    key: 'home.case-studies.subtitle',
    value: 'Our Work In Action',
    type: 'text',
    page: 'home',
    section: 'case-studies',
    label: 'Case Studies Subtitle',
    description: 'Subtitle below the Case Studies heading',
    order: 4,
  },
  {
    key: 'home.case-studies.cta',
    value: 'SEE MORE WORK',
    type: 'text',
    page: 'home',
    section: 'case-studies',
    label: 'Case Studies CTA Button',
    description: 'Text displayed on the circular CTA button in Case Studies',
    order: 5,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — CustomerFeedback (top bar text)
  // ----------------------------------------------------------------
  {
    key: 'home.testimonials.label',
    value: 'Client Testimonials',
    type: 'text',
    page: 'home',
    section: 'testimonials',
    label: 'Testimonials Section Label',
    description: 'Label text in the testimonials top bar',
    order: 1,
  },
  {
    key: 'home.testimonials.subtitle',
    value: 'Trust & Reliability',
    type: 'text',
    page: 'home',
    section: 'testimonials',
    label: 'Testimonials Subtitle',
    description: 'Subtitle text in the testimonials top bar',
    order: 2,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — BackedByStrengthStudio (mission section)
  // ----------------------------------------------------------------
  {
    key: 'home.mission.title',
    value: 'Backed by Strength',
    type: 'text',
    page: 'home',
    section: 'mission',
    label: 'Mission Section Title',
    description: 'Main h1 title for the BackedByStrength section',
    order: 0,
  },
  {
    key: 'home.mission.paragraph.1',
    value:
      'At TRD, we approach every project with precision and discipline. Through proven methods and technical expertise, we deliver structural solutions that reflect both our clients\u2019 needs and our commitment to excellence.',
    type: 'textarea',
    page: 'home',
    section: 'mission',
    label: 'Mission Paragraph 1 — Strength Header',
    description: 'h2 subheading below "Backed by Strength" in the strength-header block',
    order: 1,
  },
  {
    key: 'home.mission.paragraph.2',
    value:
      'We are the remedial experts. TRD Remedial are the specialist contractors builders and developers across NSW trust when the scope is complex, the timeline is tight, and the margin for error is zero. Structural alterations, carbon fibre reinforcement, crack injection, waterproofing, concrete cutting \u2014 we deliver it all, on time and to standard.',
    type: 'textarea',
    page: 'home',
    section: 'mission',
    label: 'Mission Paragraph 2 — Mission Intro (first h3)',
    description: 'First h3 paragraph in the mission-intro dark section',
    order: 2,
  },
  {
    key: 'home.mission.paragraph.3',
    value:
      'Our work spans occupied buildings, live construction sites, and Building Commissioner rectification orders. Whatever the challenge, we bring the expertise, the methodology, and the accountability to see it through. That\u2019s not a promise \u2014 it\u2019s how we operate.',
    type: 'textarea',
    page: 'home',
    section: 'mission',
    label: 'Mission Paragraph 3 — Mission Intro (second h3)',
    description: 'Second h3 paragraph in the mission-intro dark section',
    order: 3,
  },
  {
    key: 'home.mission.image',
    value: '/images/projects/florence-capri-complex/hero.jpg',
    type: 'image',
    page: 'home',
    section: 'mission',
    label: 'Mission Section Image',
    description: 'Project image displayed in the mission-intro column (BackedByStrengthStudio)',
    order: 4,
  },
  {
    key: 'home.mission.recognition-label',
    value: '(Recognition)',
    type: 'text',
    page: 'home',
    section: 'mission',
    label: 'Recognition Label',
    description: 'Label text above the recognition paragraph',
    order: 5,
  },
  {
    key: 'home.mission.recognition',
    value:
      'TRD Remedial is recognised across the industry for delivering structural solutions that stand the test of time. Our commitment to precision, safety, and innovation has earned us the trust of leading construction firms, property developers, and building owners throughout Sydney and NSW.',
    type: 'textarea',
    page: 'home',
    section: 'mission',
    label: 'Recognition Paragraph',
    description: 'Recognition / credibility paragraph in the BackedByStrengthStudio section',
    order: 6,
  },
  {
    key: 'home.mission.cta',
    value: 'View Our Projects',
    type: 'text',
    page: 'home',
    section: 'mission',
    label: 'Mission CTA Link Text',
    description: 'Text for the CTA link in the mission-intro section',
    order: 7,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — TeamScrollReveal (section text)
  // ----------------------------------------------------------------
  {
    key: 'home.team.heading',
    value: 'Meet The Team',
    type: 'text',
    page: 'home',
    section: 'team',
    label: 'Team Section Heading',
    description: 'Main heading for the team section',
    order: 1,
  },
  {
    key: 'home.team.outro',
    value: "Building Tomorrow's Structures",
    type: 'text',
    page: 'home',
    section: 'team',
    label: 'Team Section Outro',
    description: 'Outro text displayed below the team members',
    order: 2,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — FAQ (section text)
  // ----------------------------------------------------------------
  {
    key: 'home.faq.title',
    value: 'Frequently Asked Questions',
    type: 'text',
    page: 'home',
    section: 'faq',
    label: 'FAQ Section Title',
    description: 'Main heading for the FAQ section',
    order: 1,
  },
  {
    key: 'home.faq.subtitle',
    value: 'Get answers to common questions about our structural remediation services across Sydney',
    type: 'text',
    page: 'home',
    section: 'faq',
    label: 'FAQ Section Subtitle',
    description: 'Subtitle below the FAQ heading',
    order: 2,
  },
  {
    key: 'home.faq.cta-text',
    value: "Can't find your answer?",
    type: 'text',
    page: 'home',
    section: 'faq',
    label: 'FAQ CTA Text',
    description: 'Text above the contact CTA in the FAQ section',
    order: 3,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — EmergencyCTA (section text)
  // ----------------------------------------------------------------
  {
    key: 'home.emergency.heading',
    value: '24/7 Emergency Response',
    type: 'text',
    page: 'home',
    section: 'emergency',
    label: 'Emergency Section Heading',
    description: 'Main heading for the emergency CTA section',
    order: 1,
  },
  {
    key: 'home.emergency.body',
    value: "Our dedicated emergency response team is on standby around the clock. When structural integrity is compromised, every minute counts. We provide rapid assessment and immediate stabilization for critical structural issues.",
    type: 'textarea',
    page: 'home',
    section: 'emergency',
    label: 'Emergency Section Body',
    description: 'Body text for the emergency CTA section',
    order: 2,
  },
  {
    key: 'home.emergency.cta',
    value: 'Request Emergency Assessment',
    type: 'text',
    page: 'home',
    section: 'emergency',
    label: 'Emergency CTA Button Text',
    description: 'Text on the emergency CTA button',
    order: 3,
  },
  {
    key: 'home.emergency.subtitle',
    value: 'Critical Repairs',
    type: 'text',
    page: 'home',
    section: 'emergency',
    label: 'Emergency Subtitle',
    description: 'Subtitle in the emergency info bar',
    order: 4,
  },
  {
    key: 'home.emergency.badge',
    value: 'Emergency \u2014 24/7',
    type: 'text',
    page: 'home',
    section: 'emergency',
    label: 'Emergency Badge Text',
    description: 'Badge text in the emergency info bar',
    order: 5,
  },

  // ----------------------------------------------------------------
  // HOMEPAGE — Featured Projects (CaseStudiesOtisValen)
  // ----------------------------------------------------------------
  {
    key: 'home.featured-projects',
    value: JSON.stringify(['project-001', 'project-011', 'project-006', 'project-007', 'project-003', 'project-012']),
    type: 'json',
    page: 'home',
    section: 'case-studies',
    label: 'Featured Project IDs',
    description: 'JSON array of 6 project IDs shown in the CaseStudiesOtisValen homepage grid (order matters)',
    order: 1,
  },
];

// POST /api/admin/content/initialize
// Creates default PageContent entries for any keys that don't yet exist.
export async function POST() {
  try {
    let created = 0;

    for (const item of DEFAULT_CONTENT) {
      const exists = await prisma.pageContent.findUnique({ where: { key: item.key } });
      if (!exists) {
        await prisma.pageContent.create({ data: item });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { created, total: DEFAULT_CONTENT.length },
    });
  } catch (error) {
    console.error('[content/initialize] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize content' },
      { status: 500 }
    );
  }
}
