'use client';

import { AnimatedCopy } from '@/components/animations/AnimatedCopy';
import { OptimizedVideo } from '@/components/ui/OptimizedVideo';
import Link from 'next/link';
import './Hero.css';

interface HeroProps {
  showContent?: boolean;
}

export function Hero({ showContent = true }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-img">
        <OptimizedVideo
          src="/videos/hero-video"
          poster="/videos/hero-poster.webp"
          className="hero-video"
          priority={true}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
        />
      </div>

      <div className={`hero-header${!showContent ? ' hero-header--hidden' : ''}`}>
        <AnimatedCopy
          tag="h1"
          animateOnScroll={false}
          delay={0.2}
          trigger={showContent}
          instantVisible={false}
        >
          THE
        </AnimatedCopy>
        <AnimatedCopy
          tag="h1"
          animateOnScroll={false}
          delay={0.35}
          trigger={showContent}
          instantVisible={false}
        >
          REMEDIAL
        </AnimatedCopy>
        <AnimatedCopy
          tag="h1"
          animateOnScroll={false}
          delay={0.5}
          trigger={showContent}
          instantVisible={false}
        >
          EXPERTS
        </AnimatedCopy>
      </div>

      {showContent && (
        <div className="hero-cta">
          <Link href="/services" className="circular-btn-wrapper">
            <div className="circular-btn">
              <svg viewBox="0 0 200 200" className="circular-btn-svg">
                <defs>
                  <path
                    id="circlePath"
                    d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                  />
                </defs>
                <text className="circular-btn-text">
                  <textPath href="#circlePath" startOffset="0%">
                    EXPLORE OUR SERVICES • EXPLORE OUR SERVICES •
                  </textPath>
                </text>
              </svg>
              <div className="circular-btn-arrow">→</div>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}
