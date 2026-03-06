'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';
import { useScrollProgress } from '@/hooks/useScrollProgress';

/**
 * Scroll progress indicator component
 * - Fixed bar at top of page
 * - Shows reading progress percentage
 * - Smooth GSAP animation
 */
const ScrollProgressInternal = function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const progressBar = progressRef.current;
    if (!progressBar) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant update if reduced motion
      gsap.set(progressBar, { width: `${scrollProgress}%` });
    } else {
      // Smooth animation
      gsap.to(progressBar, {
        width: `${scrollProgress}%`,
        duration: 0.1,
        ease: 'none',
      });
    }
  }, [scrollProgress]);

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-gray-200">
      <div
        ref={progressRef}
        className="h-full bg-black transition-colors"
        style={{ width: 0 }}
      />
    </div>
  );
};

export const ScrollProgress = memo(ScrollProgressInternal);
