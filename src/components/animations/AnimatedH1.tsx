'use client';

import './AnimatedH1.css';
import { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface AnimatedH1Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  lineSelector?: string;
  animateOnScroll?: boolean;
  direction?: 'bottom' | 'top';
}

const AnimatedH1Component = function AnimatedH1({
  children,
  className = '',
  delay = 0,
  duration = 1,
  ease = 'power4.out',
  stagger = 0.1,
  lineSelector = '',
  animateOnScroll = false,
  direction = 'bottom',
}: AnimatedH1Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [headingId, setHeadingId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const textSplitRef = useRef<any>(null);

  // Generate unique ID for this instance
  useEffect(() => {
    setHeadingId(`h1-${Math.floor(Math.random() * 10000)}`);
  }, []);

  // Split text into lines and prepare for animation
  useEffect(() => {
    if (!headingId || !headingRef.current) return;

    const lineClass = `line-${headingId}`;

    // Use SplitType to split text into lines
    const text = new SplitType(headingRef.current, {
      types: 'lines',
      lineClass: lineClass,
    });

    textSplitRef.current = text;

    const selector = lineSelector || `.${lineClass}`;
    const lines = document.querySelectorAll(selector);

    // Wrap each line's content in an inner span for animation
    lines.forEach((line) => {
      const content = line.innerHTML;
      line.innerHTML = `<span class="line-inner-${headingId}">${content}</span>`;
    });

    // Set initial position based on direction
    // Use yPercent instead of y with percentage strings — GSAP requires yPercent for % transforms
    const initialYPercent = direction === 'top' ? -100 : 100;

    gsap.set(`.line-inner-${headingId}`, {
      yPercent: initialYPercent,
      display: 'block',
    });

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      if (textSplitRef.current) textSplitRef.current.revert();
    };
  }, [headingId, lineSelector, direction]);

  // Animate lines
  useGSAP(
    () => {
      if (!isInitialized || !headingRef.current) return;

      const tl = gsap.timeline({
        defaults: {
          ease,
          duration,
        },

        // Add ScrollTrigger if animateOnScroll is true
        ...(animateOnScroll
          ? {
              scrollTrigger: {
                trigger: headingRef.current,
                start: 'top 75%',
                toggleActions: 'play none none none',
              },
            }
          : {}),
      });

      // Animate lines to yPercent: 0
      tl.to(`.line-inner-${headingId}`, {
        yPercent: 0,
        stagger,
        delay,
      });

      // Cleanup ScrollTrigger on unmount
      return () => {
        if (animateOnScroll) {
          ScrollTrigger.getAll()
            .filter((st: any) => st.vars.trigger === headingRef.current)
            .forEach((st) => st.kill());
        }
      };
    },
    {
      scope: headingRef,
      dependencies: [
        isInitialized,
        animateOnScroll,
        delay,
        duration,
        ease,
        stagger,
        direction,
      ],
    }
  );

  return (
    <h1
      ref={headingRef}
      className={`animated-h1 ${className}`}
      data-heading-id={headingId}
    >
      {children}
    </h1>
  );
};

export const AnimatedH1 = memo(AnimatedH1Component);
