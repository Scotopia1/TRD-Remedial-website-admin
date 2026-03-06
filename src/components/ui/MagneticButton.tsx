'use client';

import { useRef, ReactNode, memo } from 'react';
import { gsap } from 'gsap';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  strength?: number;
  variant?: 'primary' | 'secondary' | 'cta';
}

/**
 * Magnetic button component that attracts toward cursor on hover
 * - Button moves toward cursor with smooth animation
 * - Returns to original position with elastic ease
 * - Disabled on mobile for performance
 * - Supports different visual variants
 */
const MagneticButtonInternal = function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  onMouseEnter: customOnMouseEnter,
  onMouseLeave: customOnMouseLeave,
  strength = 0.5,
  variant = 'primary',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !buttonRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const x = (clientX - centerX) * strength;
    const y = (clientY - centerY) * strength;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(buttonRef.current, { x, y });
    } else {
      gsap.to(buttonRef.current, {
        x,
        y,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseEnter = () => {
    if (customOnMouseEnter) customOnMouseEnter();
  };

  const handleMouseLeave = () => {
    if (isMobile || !buttonRef.current) return;

    if (customOnMouseLeave) customOnMouseLeave();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(buttonRef.current, { x: 0, y: 0 });
    } else {
      gsap.to(buttonRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    }
  };

  const baseClasses = 'inline-block px-8 py-4 font-semibold rounded-lg transition-all duration-300 hover:scale-105';

  const variantClasses = {
    primary: 'bg-trd-accent text-white hover:bg-trd-accent/90 shadow-lg hover:shadow-xl',
    secondary: 'bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20',
    cta: 'bg-white text-trd-primary hover:bg-white/90 shadow-xl hover:shadow-2xl',
  };

  const combinedClassName = cn(baseClasses, variantClasses[variant], className);

  const commonProps = {
    ref: buttonRef as any,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: combinedClassName,
  };

  if (href) {
    return (
      <a {...commonProps} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button {...commonProps} onClick={onClick}>
      {children}
    </button>
  );
};

export const MagneticButton = memo(MagneticButtonInternal);
