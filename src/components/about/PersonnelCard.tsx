'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { TeamMember } from '@/types/api';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface PersonnelCardProps {
  member: TeamMember;
  index: number;
  fileId: string;
}

const EXPERTISE_LEVELS: Record<string, number[]> = {
  'christopher-nassif': [98, 91, 95, 94],
  'charly-nassif': [96, 93, 97, 95, 90],
  'fahed-nassif': [99, 96, 98, 94, 92],
};

export function PersonnelCard({ member, index, fileId }: PersonnelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const bars = cardRef.current.querySelectorAll('.bb-expertise-fill');
      bars.forEach((bar, i) => {
        const pct = EXPERTISE_LEVELS[member.id]?.[i] || 80;
        (bar as HTMLElement).style.width = `${pct}%`;
      });
      const scanOverlay = cardRef.current.querySelector('.bb-photo-scan');
      if (scanOverlay) (scanOverlay as HTMLElement).style.opacity = '0';
      const redactBar = cardRef.current.querySelector('.bb-personnel-redact');
      if (redactBar) (redactBar as HTMLElement).style.display = 'none';
      return;
    }

    const triggers: ScrollTrigger[] = [];

    // Card entrance: stamp effect
    gsap.fromTo(
      cardRef.current,
      { scale: 1.03, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    // Photo scan-line reveal
    const scanOverlay = cardRef.current.querySelector('.bb-photo-scan');
    if (scanOverlay) {
      const st = ScrollTrigger.create({
        trigger: cardRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(scanOverlay, {
            yPercent: 100,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
            delay: 0.3,
          });
        },
      });
      triggers.push(st);
    }

    // Security redaction bar slide
    const redactBar = cardRef.current.querySelector('.bb-personnel-redact');
    if (redactBar) {
      const st = ScrollTrigger.create({
        trigger: cardRef.current,
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(redactBar, {
            xPercent: 101,
            duration: 0.5,
            ease: 'power3.inOut',
            delay: 0.6,
          });
        },
      });
      triggers.push(st);
    }

    // Expertise bars fill
    const bars = cardRef.current.querySelectorAll('.bb-expertise-fill');
    bars.forEach((bar, i) => {
      const pct = EXPERTISE_LEVELS[member.id]?.[i] || 80;
      gsap.fromTo(
        bar,
        { width: '0%' },
        {
          width: `${pct}%`,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bar,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.1,
        }
      );
    });

    return () => {
      triggers.forEach((st) => st.kill());
    };
  }, { scope: cardRef });

  const levels = EXPERTISE_LEVELS[member.id] || [];

  return (
    <div ref={cardRef} className="bb-personnel-card">
      <div className="bb-personnel-header">
        <span className="bb-personnel-header-text">
          +-- PERSONNEL FILE: {member.name.split(' ').reverse().join(', ').toUpperCase()} ---
        </span>
        <span className="bb-personnel-header-line" aria-hidden="true" />
      </div>

      <div className="bb-personnel-body">
        <div className="bb-personnel-photo-col">
          <div className="bb-personnel-photo">
            <Image
              src={member.image}
              alt={`${member.name} - ${member.title}`}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 1000px) 180px, 160px"
              quality={85}
              placeholder={member.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={member.blurDataURL}
              style={{
                objectFit: 'cover',
                objectPosition: 'top center',
                filter: 'grayscale(100%)',
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            />
            <div className="bb-photo-scan" aria-hidden="true" />
          </div>
        </div>

        <div className="bb-personnel-data">
          <div className="bb-data-row">
            <span className="bb-data-label">ID:</span>
            <span className="bb-data-value">{fileId}</span>
          </div>
          <div className="bb-data-row">
            <span className="bb-data-label">ROLE:</span>
            <span className="bb-data-value">{member.title.toUpperCase()}</span>
          </div>
          <div className="bb-data-row">
            <span className="bb-data-label">JOINED:</span>
            <span className="bb-data-value">2018</span>
          </div>
          <div className="bb-data-row">
            <span className="bb-data-label">SECURITY:</span>
            <span className="bb-data-value bb-data-value-redacted">
              LEVEL {index + 1}
              <span className="bb-personnel-redact" aria-hidden="true" />
            </span>
          </div>

          <div className="bb-personnel-profile">
            <span className="bb-data-label">PROFILE:</span>
            <p className="bb-profile-text">{member.bio}</p>
          </div>
        </div>
      </div>

      <div className="bb-expertise-section">
        <span className="bb-expertise-title">EXPERTISE ASSESSMENT:</span>
        {member.expertise.map((skill, i) => (
          <div key={skill} className="bb-expertise-row">
            <div className="bb-expertise-bar-track">
              <div className="bb-expertise-fill" />
            </div>
            <span className="bb-expertise-label">{skill}</span>
            <span className="bb-expertise-pct">{levels[i] || 80}%</span>
          </div>
        ))}
      </div>

      <div className="bb-personnel-footer">
        <span>+-- END FILE </span>
        <span className="bb-personnel-footer-line" aria-hidden="true" />
      </div>
    </div>
  );
}
