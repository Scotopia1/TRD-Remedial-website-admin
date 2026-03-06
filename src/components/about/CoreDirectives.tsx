'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { CompanyValue } from '@/types/api';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface CoreDirectivesProps {
  values?: CompanyValue[];
}

export function CoreDirectives({ values }: CoreDirectivesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [directives, setDirectives] = useState<CompanyValue[]>(
    values?.filter((v) => v.isText && v.title) || []
  );

  // If no values passed via props, fetch from API
  useEffect(() => {
    if (!values || values.length === 0) {
      fetch('/api/public/values')
        .then((res) => res.json())
        .then((data: CompanyValue[]) => {
          setDirectives(data.filter((v) => v.isText && v.title));
        })
        .catch(() => {
          // silently fail
        });
    }
  }, [values]);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const items = sectionRef.current.querySelectorAll('.bb-directive');
      items.forEach((item) => { (item as HTMLElement).style.opacity = '1'; });
      const badges = sectionRef.current.querySelectorAll('.bb-directive-badge');
      badges.forEach((b) => { (b as HTMLElement).style.opacity = '1'; });
      return;
    }

    const items = sectionRef.current.querySelectorAll('.bb-directive');

    items.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.15,
        }
      );

      const badge = item.querySelector('.bb-directive-badge');
      if (badge) {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              badge,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                delay: i * 0.15 + 0.5,
                onComplete: () => {
                  gsap.to(badge, {
                    opacity: 0.7,
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                  });
                },
              }
            );
          },
        });
      }

      const dotLeader = item.querySelector('.bb-directive-dots');
      if (dotLeader) {
        gsap.fromTo(
          dotLeader,
          { width: '0%' },
          {
            width: '100%',
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.15 + 0.3,
          }
        );
      }
    });
  }, { scope: sectionRef, dependencies: [directives] });

  return (
    <div ref={sectionRef} className="bb-directives">
      <h2 className="bb-section-title">CORE DIRECTIVES</h2>
      <div className="bb-section-title-underline" aria-hidden="true" />

      {directives.map((directive, i) => (
        <div key={directive.id} className="bb-directive">
          <div className="bb-directive-header">
            <span className="bb-directive-prefix" aria-hidden="true">&gt; </span>
            <span className="bb-directive-label">
              DIRECTIVE {String(i + 1).padStart(3, '0')}: {directive.title}
            </span>
          </div>
          <p className="bb-directive-desc">{directive.description}</p>
          <div className="bb-directive-status">
            <span className="bb-directive-status-label">STATUS: </span>
            <span className="bb-directive-badge">[ACTIVE]</span>
            <span className="bb-directive-dots" aria-hidden="true" />
            <span className="bb-directive-since">SINCE: 2018</span>
          </div>
        </div>
      ))}
    </div>
  );
}
