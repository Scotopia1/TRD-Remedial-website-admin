'use client';

import { useRef, ReactNode, memo } from 'react';
import { gsap } from 'gsap';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MagneticTextProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Magnetic text component that follows cursor on hover
 * - Text moves toward cursor with smooth animation
 * - Returns to original position with elastic ease
 * - Disabled on mobile for performance
 */
const MagneticTextInternal = function MagneticText({ children, className = '', strength = 0.3 }: MagneticTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isMobile || !textRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = textRef.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(textRef.current, { x, y });
    } else {
      gsap.to(textRef.current, {
        x,
        y,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (isMobile || !textRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(textRef.current, { x: 0, y: 0 });
    } else {
      gsap.to(textRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    }
  };

  return (
    <span
      className={`inline-block ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={textRef} className="inline-block">
        {children}
      </span>
    </span>
  );
};

export const MagneticText = memo(MagneticTextInternal);
