'use client';

import { useEffect, useRef } from 'react';

// Global state for scroll lock management
let lockCount = 0;
let originalOverflow: string | null = null;
let originalPaddingRight: string | null = null;

// Debug mode - set to true to see console logs
const DEBUG = false;

function debugLog(...args: any[]) {
  if (DEBUG && typeof window !== 'undefined') {
    console.log('[useScrollLock]', ...args);
  }
}

/**
 * Centralized scroll lock management with reference counting.
 * Prevents conflicts between multiple components trying to lock scroll.
 *
 * @param isLocked - Whether scroll should be locked
 *
 * @example
 * ```tsx
 * // In a modal component
 * useScrollLock(isOpen);
 *
 * // In a menu component
 * useScrollLock(isMenuOpen);
 * ```
 *
 * Multiple components can use this hook simultaneously. The scroll will only
 * be unlocked when all components have released their locks.
 */
export function useScrollLock(isLocked: boolean) {
  const isLockedRef = useRef(false);
  const componentId = useRef(`component-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    debugLog(`[${componentId.current}] Effect triggered. isLocked=${isLocked}, current=${isLockedRef.current}, lockCount=${lockCount}`);

    // If lock state hasn't changed, do nothing
    if (isLockedRef.current === isLocked) {
      debugLog(`[${componentId.current}] No change, skipping`);
      return;
    }

    if (isLocked) {
      // Increment lock count
      lockCount++;
      debugLog(`[${componentId.current}] LOCKING. lockCount=${lockCount}`);

      // On first lock, save original state and lock scroll
      if (lockCount === 1) {
        originalOverflow = document.body.style.overflow || null;
        originalPaddingRight = document.body.style.paddingRight || null;

        debugLog(`[${componentId.current}] First lock - saving original state:`, { originalOverflow, originalPaddingRight });

        // Lock scroll
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        // Prevent layout shift from scrollbar removal
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        debugLog(`[${componentId.current}] Scroll LOCKED. body.overflow=${document.body.style.overflow}`);
      } else {
        debugLog(`[${componentId.current}] Additional lock (already locked)`);
      }

      isLockedRef.current = true;
    } else {
      // Decrement lock count
      if (lockCount > 0) {
        lockCount--;
      }
      debugLog(`[${componentId.current}] UNLOCKING. lockCount=${lockCount}`);

      // Only unlock when all locks are released
      if (lockCount === 0) {
        debugLog(`[${componentId.current}] All locks released - restoring scroll`);

        // Restore original overflow values
        if (originalOverflow !== null) {
          document.body.style.overflow = originalOverflow;
          debugLog(`[${componentId.current}] Restored overflow to: "${originalOverflow}"`);
        } else {
          document.body.style.removeProperty('overflow');
          debugLog(`[${componentId.current}] Removed overflow property`);
        }

        if (originalPaddingRight !== null) {
          document.body.style.paddingRight = originalPaddingRight;
        } else {
          document.body.style.removeProperty('padding-right');
        }

        document.documentElement.style.removeProperty('overflow');

        debugLog(`[${componentId.current}] Scroll UNLOCKED. body.overflow=${document.body.style.overflow || 'default'}`);

        // Reset saved values
        originalOverflow = null;
        originalPaddingRight = null;
      } else {
        debugLog(`[${componentId.current}] Still locked by other components (lockCount=${lockCount})`);
      }

      isLockedRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      debugLog(`[${componentId.current}] CLEANUP triggered. wasLocked=${isLockedRef.current}, lockCount=${lockCount}`);

      if (isLockedRef.current) {
        if (lockCount > 0) {
          lockCount--;
          debugLog(`[${componentId.current}] Cleanup decrement. lockCount=${lockCount}`);
        }

        if (lockCount === 0) {
          debugLog(`[${componentId.current}] Cleanup unlocking scroll (last component)`);
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
          document.documentElement.style.removeProperty('overflow');
          originalOverflow = null;
          originalPaddingRight = null;
          debugLog(`[${componentId.current}] Cleanup complete. Scroll unlocked.`);
        } else {
          debugLog(`[${componentId.current}] Cleanup complete. Still locked by ${lockCount} other component(s)`);
        }
      } else {
        debugLog(`[${componentId.current}] Cleanup - component was not locking`);
      }
    };
  }, [isLocked]);
}
