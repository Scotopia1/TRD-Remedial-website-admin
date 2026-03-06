'use client';

import { useEffect } from 'react';

/**
 * Aggressive scroll unlock that runs IMMEDIATELY on mount
 * This ensures scroll is NEVER locked on initial page load
 * Runs before ANY other components can lock scroll
 */
export function ScrollUnlockProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // IMMEDIATE cleanup - runs synchronously
    const unlockScroll = () => {
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');

      if (process.env.NODE_ENV === 'development') console.log('[ScrollUnlockProvider] Forced scroll unlock');
    };

    // Run immediately
    unlockScroll();

    // Run again after a tiny delay (catch race conditions)
    const timer1 = setTimeout(unlockScroll, 0);
    const timer2 = setTimeout(unlockScroll, 100);
    const timer3 = setTimeout(unlockScroll, 500);

    // Cleanup
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return <>{children}</>;
}
