import { useState, useEffect } from 'react';

/**
 * Hook to track scroll progress as a percentage (0-100)
 * @returns Current scroll progress percentage
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = height > 0 ? (scrolled / height) * 100 : 0;
      setProgress(scrollProgress);
    };

    // Update on mount
    updateProgress();

    // Update on scroll
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}
