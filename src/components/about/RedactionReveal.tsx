'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface RedactionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RedactionReveal({
  children,
  className = '',
  delay = 0,
}: RedactionRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bar = containerRef.current.querySelector('.bb-redact-overlay');

    if (prefersReduced) {
      if (bar) (bar as HTMLElement).style.display = 'none';
      return;
    }

    gsap.set(bar, { xPercent: 0 });

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(bar, {
          xPercent: -101,
          duration: 0.8,
          ease: 'power3.inOut',
          delay,
        });
      },
    });

    return () => { st.kill(); };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`bb-redaction-reveal ${className}`}>
      <div className="bb-redact-content">{children}</div>
      <div className="bb-redact-overlay" aria-hidden="true" />
    </div>
  );
}
