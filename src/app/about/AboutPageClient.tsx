'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { TeamMember } from '@/types/api';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Dynamic imports for sub-components (SSR disabled for GSAP-heavy components) */
const TypewriterText = dynamic(
  () => import('@/components/about/TypewriterText').then((mod) => mod.TypewriterText),
  { ssr: false }
);

const PersonnelCard = dynamic(
  () => import('@/components/about/PersonnelCard').then((mod) => mod.PersonnelCard),
  { ssr: false }
);

const StatsReadout = dynamic(
  () => import('@/components/about/StatsReadout').then((mod) => mod.StatsReadout),
  { ssr: false }
);

const CoreDirectives = dynamic(
  () => import('@/components/about/CoreDirectives').then((mod) => mod.CoreDirectives),
  { ssr: false }
);

const RedactionReveal = dynamic(
  () => import('@/components/about/RedactionReveal').then((mod) => mod.RedactionReveal),
  { ssr: false }
);

/* Document metadata lines for typewriter */
const DOC_META_LINES = [
  { label: 'DOCUMENT TYPE:  ', value: 'COMPANY PROFILE' },
  { label: 'SUBJECT:        ', value: 'TRD REMEDIAL PTY LTD' },
  { label: 'LOCATION:       ', value: 'SYDNEY, NSW, AUSTRALIA' },
  { label: 'ESTABLISHED:    ', value: '2018' },
  { label: 'STATUS:         ', value: 'ACTIVE', isRedacted: true },
  { label: 'CLEARANCE:      ', value: 'STRUCTURAL EXPERTS' },
];

/* Project evidence images for mission section */
const EVIDENCE_IMAGES = [
  {
    src: '/images/projects/caringbah-pavilion/featured.jpg',
    alt: 'Caringbah Pavilion structural remediation',
  },
  {
    src: '/images/projects/pelican-road-schofields/featured.jpg',
    alt: 'Pelican Road Schofields carbon fibre reinforcement',
  },
  {
    src: '/images/projects/northbridge-structural-wall/featured.jpg',
    alt: 'Northbridge structural wall repair works',
  },
];

/* Personnel file IDs */
const FILE_IDS = ['CN-001', 'CN-002', 'FN-001'];

interface AboutPageClientProps {
  teamMembers: TeamMember[];
}

/* ================================================================
   ABOUT PAGE -- BLACK BOX
   Declassified Technical Dossier
   ================================================================ */
export function AboutPageClient({ teamMembers }: AboutPageClientProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!pageRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion) return;

      /* -----------------------------------------------
         HERO: TRD letter fade-in with stagger
         ----------------------------------------------- */
      if (heroRef.current) {
        const letters = heroRef.current.querySelectorAll('.bb-trd-letter');
        if (letters.length > 0) {
          gsap.fromTo(
            letters,
            { opacity: 0, scale: 0.95 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.3,
              delay: 1.8,
              ease: 'power3.out',
            }
          );
        }

        const prompt = heroRef.current.querySelector('.bb-scroll-prompt');
        if (prompt) {
          gsap.fromTo(
            prompt,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, delay: 3, ease: 'power2.out' }
          );
        }
      }

      /* -----------------------------------------------
         MISSION: Document frame draw
         ----------------------------------------------- */
      const docFrame = pageRef.current.querySelector('.bb-doc-frame');
      if (docFrame) {
        gsap.fromTo(
          docFrame,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: docFrame,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      const thumbs = pageRef.current.querySelectorAll('.bb-evidence-thumb');
      thumbs.forEach((thumb, i) => {
        gsap.fromTo(
          thumb,
          { clipPath: 'circle(0% at 50% 50%)' },
          {
            clipPath: 'circle(100% at 50% 50%)',
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: thumb,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.15,
          }
        );
      });

      /* -----------------------------------------------
         CTA: End of file animations
         ----------------------------------------------- */
      if (ctaRef.current) {
        const eofLines = ctaRef.current.querySelectorAll('.bb-eof-line');
        eofLines.forEach((line, i) => {
          gsap.fromTo(
            line,
            { opacity: 0, x: -10 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
              delay: i * 0.3,
            }
          );
        });

        const heading = ctaRef.current.querySelector('.bb-cta-heading');
        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: heading,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        const buttons = ctaRef.current.querySelectorAll('.bb-cta-btn');
        if (buttons.length > 0) {
          gsap.fromTo(
            buttons,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 60%',
                toggleActions: 'play none none none',
              },
            }
          );
        }

        const contactLines = ctaRef.current.querySelectorAll('.bb-cta-contact-line');
        contactLines.forEach((line, i) => {
          gsap.fromTo(
            line,
            { opacity: 0, x: -5 },
            {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 50%',
                toggleActions: 'play none none none',
              },
              delay: i * 0.1 + 0.5,
            }
          );
        });
      }

      scrollTriggerManager.requestRefresh();

      return () => {
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    },
    { scope: pageRef }
  );

  return (
    <div className="bb-page" ref={pageRef}>
      {/* ================================================================
          SECTION 1: HERO -- "File Access"
          ================================================================ */}
      <section
        className="bb-hero"
        id="bb-hero"
        ref={heroRef}
        aria-label="File Access"
      >
        <div className="bb-doc-meta">
          <TypewriterText
            lines={DOC_META_LINES}
            charSpeed={0.025}
            lineDelay={0.15}
            startDelay={0.8}
          />
        </div>

        <div className="bb-trd-letters" aria-label="TRD">
          <span className="bb-trd-letter" aria-hidden="true">T</span>
          <span className="bb-trd-letter" aria-hidden="true">R</span>
          <span className="bb-trd-letter" aria-hidden="true">D</span>
        </div>

        <div className="bb-scroll-prompt">
          <span>[SCROLL TO DECLASSIFY]</span>
          <span className="bb-cursor" aria-hidden="true">_</span>
        </div>
      </section>

      {/* ================================================================
          SECTION 2: MISSION -- "Declassified Brief"
          ================================================================ */}
      <section className="bb-mission" id="bb-mission" aria-label="Mission">
        <div className="bb-doc-frame">
          <div className="bb-doc-frame-header">
            +-- DOCUMENT BEGIN -----------------------------------------------
          </div>

          <p className="bb-mission-subject">SUBJECT: OPERATIONAL MANDATE</p>

          <p className="bb-mission-body">
            TRD Remedial is Sydney&apos;s trusted partner for structural remediation
            and concrete repair. With decades of combined experience, we specialize
            in post-tension repairs, carbon fibre reinforcement, and advanced
            diagnostic services that keep buildings safe and structurally sound.
          </p>

          <RedactionReveal delay={0.2}>
            <p className="bb-hidden-quote">
              &ldquo;When the scope is complex, the timeline is tight, and the
              margin for error is zero &mdash; we deliver.&rdquo;
            </p>
          </RedactionReveal>

          <p className="bb-evidence-label">[ATTACHED: PROJECT EVIDENCE]</p>

          <div className="bb-evidence-grid">
            {EVIDENCE_IMAGES.map((img, i) => (
              <div key={i} className="bb-evidence-thumb">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 280px"
                  quality={80}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>

          <div className="bb-doc-frame-footer">
            +-- DOCUMENT END -------------------------------------------------
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3: PERSONNEL FILES -- "Team Dossier"
          ================================================================ */}
      <section className="bb-personnel" id="bb-personnel" aria-label="Personnel Files">
        <div className="bb-personnel-wrapper">
          {teamMembers.map((member, idx) => (
            <PersonnelCard
              key={member.id}
              member={member}
              index={idx}
              fileId={FILE_IDS[idx]}
            />
          ))}
        </div>
      </section>

      {/* ================================================================
          SECTION 4: STATS -- "Black Box Readout"
          ================================================================ */}
      <section className="bb-stats" id="bb-data" aria-label="Operational Statistics">
        <StatsReadout />
      </section>

      {/* ================================================================
          SECTION 5: VALUES -- "Core Directives"
          ================================================================ */}
      <section className="bb-directives-section" id="bb-directives" aria-label="Core Directives">
        <CoreDirectives />
      </section>

      {/* ================================================================
          SECTION 6: CTA -- "End Transmission"
          ================================================================ */}
      <section className="bb-cta" id="bb-contact" ref={ctaRef} aria-label="Contact">
        <div className="bb-cta-content">
          <div className="bb-eof-lines">
            <div className="bb-eof-line">
              <span className="bb-eof-prefix">&gt; </span>END OF DOCUMENT
            </div>
            <div className="bb-eof-line">
              <span className="bb-eof-prefix">&gt; </span>TRANSMISSION COMPLETE
            </div>
          </div>

          <h2 className="bb-cta-heading">Initiate Contact Protocol</h2>

          <div className="bb-cta-buttons">
            <Link href="/contact" className="bb-cta-btn bb-cta-btn-primary">
              Establish Connection
            </Link>
            <Link href="/projects" className="bb-cta-btn bb-cta-btn-secondary">
              View Case Files
            </Link>
          </div>

          <div className="bb-cta-contact">
            <div className="bb-cta-contact-line">
              <span className="bb-cta-contact-prefix">&gt; </span>
              <a href="mailto:contact@trdremedial.com.au">contact@trdremedial.com.au</a>
            </div>
            <div className="bb-cta-contact-line">
              <span className="bb-cta-contact-prefix">&gt; </span>
              <a href="https://trdremedial.com.au" target="_blank" rel="noopener noreferrer">
                trdremedial.com.au
              </a>
            </div>
            <div className="bb-cta-contact-line">
              <span className="bb-cta-contact-prefix">&gt; </span>
              Sydney, NSW, Australia
            </div>
          </div>

          <span className="bb-cta-cursor" aria-hidden="true">_</span>
        </div>
      </section>
    </div>
  );
}
