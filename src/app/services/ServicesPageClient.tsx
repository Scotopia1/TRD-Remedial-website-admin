'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Service } from '@/types/api';
import { AnimatedH1 } from '@/components/animations/AnimatedH1';
import { AnimatedCopy } from '@/components/animations/AnimatedCopy';
import { useStore } from '@/stores/useStore';

const ParallaxImage = dynamic(
  () => import('@/components/animations/ParallaxImage').then(mod => mod.ParallaxImage),
  { ssr: false }
);

interface ServicesPageClientProps {
  services: Service[];
}

export function ServicesPageClient({ services }: ServicesPageClientProps) {
  const setCursorVariant = useStore((state) => state.setCursorVariant);

  return (
    <div className="services-page">
      {/* Hero Section - 100svh */}
      <section className="services-hero">
        <div className="services-hero-content">
          <AnimatedH1 delay={0.5} className="services-hero-title">
            Our Services
          </AnimatedH1>
          <AnimatedCopy delay={0.7} tag="p" className="services-hero-description">
            Multiple disciplines. One trusted contractor.
            <br />
            Precision engineering meets hands-on expertise.
          </AnimatedCopy>
        </div>
      </section>

      {/* Services Grid - Each 100svh */}
      <section className="services-grid">
        {services.map((service, index) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="service-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            {/* Parallax Background Image */}
            <div className="service-card-image">
              <ParallaxImage
                src={service.heroImage || service.visual}
                alt={service.title}
                speed={0.2}
              />
            </div>

            {/* Overlay with Service Info */}
            <div className="service-overlay">
              <div className="service-number">
                {String(index + 1).padStart(2, '0')}
              </div>
              <AnimatedH1
                animateOnScroll={true}
                className="service-title"
              >
                {service.title}
              </AnimatedH1>
              <AnimatedCopy
                animateOnScroll={true}
                delay={0.15}
                tag="p"
                className="service-tagline"
              >
                {service.tagline}
              </AnimatedCopy>
            </div>

            {/* Hover Arrow Indicator */}
            <div className="service-arrow">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <AnimatedH1 animateOnScroll={true} className="services-cta-title">
          Need Expert Advice?
        </AnimatedH1>
        <AnimatedCopy
          animateOnScroll={true}
          delay={0.15}
          tag="p"
          className="services-cta-description"
        >
          Contact our team for a free consultation and site assessment.
        </AnimatedCopy>
        <Link
          href="/contact"
          className="services-cta-button"
          onMouseEnter={() => setCursorVariant('cta')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          Get In Touch
        </Link>
      </section>
    </div>
  );
}
