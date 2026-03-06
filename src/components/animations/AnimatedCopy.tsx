'use client';

import './AnimatedCopy.css';
import { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface AnimatedCopyProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  lineSelector?: string;
  animateOnScroll?: boolean;
  direction?: 'top' | 'bottom';
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  trigger?: boolean;
  instantVisible?: boolean; // Show text immediately, animate later (for LCP optimization)
}

const AnimatedCopyComponent = function AnimatedCopy({
  children,
  className = '',
  delay = 0,
  duration = 1,
  ease = 'power4.out',
  stagger = 0.05,
  lineSelector = '',
  animateOnScroll = true,
  direction = 'bottom',
  tag = 'p',
  trigger = true,
  instantVisible = false,
}: AnimatedCopyProps) {
  const copyRef = useRef<HTMLElement>(null);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const textSplitRef = useRef<SplitType | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setCopyId(`copy-${Math.floor(Math.random() * 10000)}`);
  }, []);

  useEffect(() => {
    if (!copyId || !copyRef.current) return;

    const lineClass = `line-${copyId}`;

    const text = new SplitType(copyRef.current, {
      types: 'lines',
      lineClass: lineClass,
    });

    textSplitRef.current = text;

    const selector = lineSelector || `.${lineClass}`;
    const lines = document.querySelectorAll(selector);

    lines.forEach((line) => {
      const content = line.innerHTML;
      line.innerHTML = `<span class="line-inner-${copyId}">${content}</span>`;
    });

    // Use yPercent instead of y with percentage strings — GSAP requires yPercent for % transforms
    const initialYPercent = direction === 'top' ? -100 : 100;

    gsap.set(`.line-inner-${copyId}`, {
      yPercent: instantVisible ? 0 : initialYPercent, // Show immediately if instantVisible
      display: 'block',
    });

    setIsInitialized(true);

    return () => {
      if (textSplitRef.current) textSplitRef.current.revert();
    };
  }, [copyId, lineSelector, direction]);

  useGSAP(
    () => {
      // Wait for initialization and trigger (if using trigger mode)
      if (!isInitialized || !copyRef.current) return;
      // For non-scroll animations, wait for trigger and prevent re-animation
      if (!animateOnScroll && (!trigger || hasAnimated.current)) return;

      if (!animateOnScroll) {
        hasAnimated.current = true;
      }

      const tl = gsap.timeline({
        defaults: {
          ease,
          duration,
        },
        ...(animateOnScroll
          ? {
              scrollTrigger: {
                trigger: copyRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          : {}),
      });

      tl.to(`.line-inner-${copyId}`, {
        yPercent: 0,
        stagger,
        delay,
      });

      return () => {
        if (animateOnScroll) {
          ScrollTrigger.getAll()
            .filter((st) => st.vars.trigger === copyRef.current)
            .forEach((st) => st.kill());
        }
      };
    },
    {
      scope: copyRef,
      dependencies: [
        isInitialized,
        animateOnScroll,
        delay,
        duration,
        ease,
        stagger,
        direction,
        trigger,
      ],
    }
  );

  const Tag = tag;

  return (
    <Tag
      ref={copyRef as any}
      className={`animated-copy ${className}`}
      data-copy-id={copyId}
    >
      {children}
    </Tag>
  );
};

export const AnimatedCopy = memo(AnimatedCopyComponent);
