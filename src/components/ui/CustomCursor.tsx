'use client';

import { useEffect, useRef, memo } from 'react';
import { gsap } from 'gsap';

/**
 * Custom cursor component - CGMWTDEC2024 "Origin" Style
 * - Large circular cursor with arrow icon
 * - Expands on hover over interactive elements
 * - Hidden on mobile/touch devices
 * - Respects prefers-reduced-motion
 */
const CustomCursorInternal = function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for mobile/touch devices
    const isMobile = window.innerWidth <= 900;
    const isTouchDevice = 'ontouchstart' in window;

    if (isMobile || isTouchDevice) return;

    const cursor = cursorRef.current;
    const icon = iconRef.current;
    if (!cursor || !icon) return;

    // Initial state - cursor tiny, icon hidden
    gsap.set(cursor, {
      scale: 0.1,
    });

    gsap.set(icon, {
      scale: 0,
    });

    // Mouse move handler
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    // Target services section containers - cursor stays expanded in entire section
    const servicesContainers = document.querySelectorAll(
      '.services-intro, .services-sticky-cards'
    );

    const handleServicesEnter = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        onStart: () => {
          gsap.to(icon, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        },
      });
    };

    const handleServicesLeave = () => {
      gsap.to(icon, {
        scale: 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
          gsap.to(cursor, {
            scale: 0.1,
            duration: 0.5,
            ease: 'power2.out',
          });
        },
      });
    };

    servicesContainers.forEach((container) => {
      container.addEventListener('mouseenter', handleServicesEnter);
      container.addEventListener('mouseleave', handleServicesLeave);
    });

    // Target all other clickable elements (outside services section)
    const targetElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"]'
    );

    const handleTargetEnter = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        onStart: () => {
          gsap.to(icon, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        },
      });
    };

    const handleTargetLeave = () => {
      gsap.to(icon, {
        scale: 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
          gsap.to(cursor, {
            scale: 0.1,
            duration: 0.5,
            ease: 'power2.out',
          });
        },
      });
    };

    targetElements.forEach((element) => {
      element.addEventListener('mouseenter', handleTargetEnter);
      element.addEventListener('mouseleave', handleTargetLeave);
    });

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);

      servicesContainers.forEach((container) => {
        container.removeEventListener('mouseenter', handleServicesEnter);
        container.removeEventListener('mouseleave', handleServicesLeave);
      });

      targetElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleTargetEnter);
        element.removeEventListener('mouseleave', handleTargetLeave);
      });
    };
  }, []);

  return (
    <div className="cursor" ref={cursorRef}>
      <div className="cursor-icon" ref={iconRef}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6v2h8.59L5 17.59 6.41 19 16 9.41V18h2V6z" />
        </svg>
      </div>
    </div>
  );
};

export const CustomCursor = memo(CustomCursorInternal);
