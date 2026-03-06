'use client';

import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import Link from 'next/link';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Enable keyboard navigation detection
  useKeyboardNav();

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <Link href="#main-content" className="skip-to-content">
        Skip to main content
      </Link>

      {/* Landmark regions for screen readers */}
      {children}
    </>
  );
}
