'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitType from 'split-type';
import Link from 'next/link';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';
import './IntroStats.css';

export function IntroStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const copyRef = useRef<HTMLHeadingElement>(null);
  const copyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
  }, []);

  // Header slide animation with SplitType
  useGSAP(() => {
    if (!headerRef.current) return;

    // Use ScrollTrigger manager to coordinate timing
    scrollTriggerManager.onReady(() => {
      const split = new SplitType(headerRef.current!, {
        types: 'lines',
        lineClass: 'line-mask',
      });

      // Wrap each line in a mask container
      split.lines?.forEach((line) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'line-wrapper';
        wrapper.style.overflow = 'hidden';

        const parent = line.parentNode;
        parent?.insertBefore(wrapper, line);
        wrapper.appendChild(line);

        // Set initial state
        gsap.set(line, { yPercent: 100 });
      });

      // Animate lines
      if (split.lines && split.lines.length > 0) {
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        });
      }

      // Request refresh after setup
      scrollTriggerManager.requestRefresh();
    });
  }, []);

  // Text reveal animation with SplitType (WORD-BY-WORD)
  useGSAP(() => {
    if (!copyRef.current || !copyContainerRef.current) return;

    scrollTriggerManager.onReady(() => {
      const split = new SplitType(copyRef.current!, {
        types: 'words',
        wordClass: 'word',
      });

      // Set initial opacity
      if (!split.words || split.words.length === 0) return;
      gsap.set(split.words, { opacity: 0 });

      ScrollTrigger.create({
        trigger: copyContainerRef.current,
        start: 'top 75%',
        end: 'center center',
        onUpdate: (self) => {
          const progress = self.progress;
          const totalWords = split.words?.length || 0;

          split.words?.forEach((word, index) => {
            const wordProgress = index / totalWords;
            const nextWordProgress = (index + 1) / totalWords;

            let opacity = 0;

            if (progress >= nextWordProgress) {
              opacity = 1;
            } else if (progress >= wordProgress) {
              const fadeProgress = (progress - wordProgress) / (nextWordProgress - wordProgress);
              opacity = fadeProgress;
            }

            gsap.set(word, { opacity });
          });
        },
      });

      scrollTriggerManager.requestRefresh();
    });
  }, []);

  return (
    <section ref={sectionRef} className="intro-stats">
      <div className="intro-container">
        {/* Header */}
        <div className="intro-header">
          <h1 ref={headerRef}>
            Why TRD Remedial?
          </h1>
        </div>

        {/* Copy */}
        <div ref={copyContainerRef} className="intro-copy">
          <div className="intro-copy-wrapper">
            <h3 ref={copyRef}>
              We solve structural challenges others can't handle. As Sydney's leading structural remediation experts, we deliver precision concrete repair solutions with 8 years of proven expertise, 24/7 emergency response, and unwavering commitment to building compliance. From structural remediation Sydney projects to complex concrete repair Sydney jobs, TRD delivers solutions that last.
            </h3>
            <Link href="/about" className="intro-learn-more">
              Learn more about our approach →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
