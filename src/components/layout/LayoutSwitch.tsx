'use client';

import { usePathname } from 'next/navigation';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';
import { TransitionProvider } from '@/components/providers/TransitionProvider';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Menu } from '@/components/layout/Menu';
import { Footer } from '@/components/sections/Footer';
import { WebVitals } from '@/components/analytics/WebVitals';

export function LayoutSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <WebVitals />
      <AccessibilityProvider>
        <ScrollToTop />
        <Menu />
        <CustomCursor />
        <ScrollProgress />
        <TransitionProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
          <Footer />
        </TransitionProvider>
      </AccessibilityProvider>
    </>
  );
}
