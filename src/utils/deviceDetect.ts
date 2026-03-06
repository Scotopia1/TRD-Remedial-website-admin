/**
 * Device Detection Utilities
 *
 * Provides iOS detection and viewport utilities optimized for Safari quirks
 */

/**
 * Detect iOS devices including iPadOS 13+ (which reports as desktop)
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Detect if device is mobile (CGMWTAUG2025 pattern: pure width-based)
 * Uses 1000px breakpoint - iPads and tablets with width > 1000px get desktop experience
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.innerWidth <= 1000;
};

/**
 * Detect if device is tablet (between mobile and desktop)
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;

  return window.innerWidth > 1000 && window.innerWidth <= 1200;
};

/**
 * Get viewport height accounting for iOS Safari dynamic UI
 *
 * iOS Safari hides/shows address bar during scroll, causing innerHeight to change.
 * visualViewport.height provides stable height during scroll.
 */
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;

  // Use visualViewport on iOS for stable height
  if (isIOS() && 'visualViewport' in window && window.visualViewport) {
    return window.visualViewport.height;
  }

  return window.innerHeight;
};

/**
 * Get viewport width accounting for scrollbar
 */
export const getViewportWidth = (): number => {
  if (typeof window === 'undefined') return 0;

  if (isIOS() && 'visualViewport' in window && window.visualViewport) {
    return window.visualViewport.width;
  }

  return window.innerWidth;
};

/**
 * Check if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get iOS version (returns null if not iOS)
 */
export const getIOSVersion = (): number | null => {
  if (!isIOS()) return null;

  const match = navigator.userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Check if running in standalone mode (PWA)
 */
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    (window.navigator as any).standalone ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};

/**
 * Stable viewport height for GSAP ScrollTrigger calculations.
 * Captured once on mount to prevent animation recalculations
 * when mobile browser chrome toggles during scroll.
 */
let _stableHeight: number = 0;

export const setStableHeight = (): void => {
  if (typeof window === 'undefined') return;
  if (isIOS() && window.visualViewport) {
    _stableHeight = window.visualViewport.height;
  } else {
    _stableHeight = window.innerHeight;
  }
};

export const getStableHeight = (): number => {
  if (_stableHeight > 0) return _stableHeight;
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
};
