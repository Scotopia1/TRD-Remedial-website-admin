'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormErrorSummaryProps {
  errorCount: number;
  show: boolean;
}

export function FormErrorSummary({ errorCount, show }: FormErrorSummaryProps) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && errorCount > 0) {
      // Scroll to first error field
      const firstError = document.querySelector('[data-field-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (bannerRef.current) {
        bannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [show, errorCount]);

  if (!show || errorCount === 0) return null;

  return (
    <div
      ref={bannerRef}
      className="bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 text-sm shadow-sm"
      style={{ fontFamily: 'system-ui' }}
    >
      <AlertTriangle size={16} className="flex-shrink-0" />
      <span>
        Please fix {errorCount} {errorCount === 1 ? 'error' : 'errors'} below
      </span>
    </div>
  );
}
