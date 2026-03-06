'use client';

import { useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TypewriterLine {
  label?: string;
  value: string;
  isRedacted?: boolean;
}

interface TypewriterTextProps {
  lines: TypewriterLine[];
  charSpeed?: number;
  lineDelay?: number;
  className?: string;
  triggerOnScroll?: boolean;
  startDelay?: number;
}

export function TypewriterText({
  lines,
  charSpeed = 0.03,
  lineDelay = 0.2,
  className = '',
  triggerOnScroll = false,
  startDelay = 0,
}: TypewriterTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (!containerRef.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const lineEls = containerRef.current.querySelectorAll('.bb-tw-line');
    const tl = gsap.timeline({ delay: startDelay });

    lineEls.forEach((lineEl, i) => {
      const chars = lineEl.querySelectorAll('.bb-tw-char');
      const redactionBar = lineEl.querySelector('.bb-redaction-bar');

      tl.to(
        chars,
        {
          opacity: 1,
          duration: 0.01,
          stagger: charSpeed,
        },
        i === 0 ? 0 : `>+=${lineDelay}`
      );

      if (redactionBar) {
        tl.to(
          redactionBar,
          {
            xPercent: 101,
            duration: 0.6,
            ease: 'power3.inOut',
          },
          '>+=0.3'
        );
      }
    });
  }, [charSpeed, lineDelay, startDelay]);

  useGSAP(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      if (containerRef.current) {
        const chars = containerRef.current.querySelectorAll('.bb-tw-char');
        const bars = containerRef.current.querySelectorAll('.bb-redaction-bar');
        chars.forEach((c) => ((c as HTMLElement).style.opacity = '1'));
        bars.forEach((b) => ((b as HTMLElement).style.display = 'none'));
      }
      return;
    }

    if (triggerOnScroll) {
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
        onEnter: animate,
      });
      return () => { st.kill(); };
    } else {
      animate();
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`bb-typewriter ${className}`}>
      {lines.map((line, i) => (
        <div key={i} className="bb-tw-line">
          {line.label && (
            <span className="bb-tw-label">
              {line.label.split('').map((char, ci) => (
                <span key={ci} className="bb-tw-char" style={{ opacity: 0 }}>
                  {char}
                </span>
              ))}
            </span>
          )}
          <span className={`bb-tw-value ${line.isRedacted ? 'bb-tw-redacted' : ''}`}>
            {line.value.split('').map((char, ci) => (
              <span key={ci} className="bb-tw-char" style={{ opacity: 0 }}>
                {char}
              </span>
            ))}
            {line.isRedacted && (
              <span className="bb-redaction-bar" aria-hidden="true" />
            )}
          </span>
        </div>
      ))}
      <span className="bb-cursor" aria-hidden="true">_</span>
    </div>
  );
}
