'use client';

import './CustomerFeedback.css';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';
import { getStableHeight } from '@/utils/deviceDetect';

gsap.registerPlugin(ScrollTrigger);

// Customer feedback data - TRD construction/engineering testimonials
const customerFeedback = [
  {
    id: 1,
    copy: "TRD's carbon fibre reinforcement solution saved our heritage bridge from demolition. Their technical precision and minimal disruption approach exceeded all expectations.",
    author: "David Martinez",
    role: "Infrastructure Director",
  },
  {
    id: 2,
    copy: "The GPR scanning work revealed critical structural issues we never knew existed. TRD's detailed reporting and proactive solutions prevented what could have been a catastrophic failure.",
    author: "Sarah Chen",
    role: "Facility Manager",
  },
  {
    id: 3,
    copy: "Professional, methodical, and completely reliable. TRD handled our multi-level car park crack injection with zero downtime to our operations. Exceptional project management.",
    author: "Michael Thompson",
    role: "Property Operations",
  },
];

export function CustomerFeedback() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Create progress indicators on mount
  useEffect(() => {
    if (!sectionRef.current) return;

    const progressBarContainer = document.querySelector('.feedback-progress-bar');
    if (!progressBarContainer) return;

    // Create 30 progress indicators (matching reference design)
    for (let i = 0; i < 30; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'progress-indicator';
      progressBarContainer.appendChild(indicator);
    }
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const progressBar = progressBarRef.current;

    // Calculate how far to translate - works on all screen sizes
    const calculateDimensions = () => {
      const wrapperWidth = wrapper.offsetWidth;
      const viewportWidth = window.innerWidth;
      return -(wrapperWidth - viewportWidth);
    };

    let moveDistance = calculateDimensions();

    // Detect Safari and iOS for optimized scrub value
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Create horizontal scroll animation (works on all screen sizes)
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => `+=${getStableHeight() * 5}px`,
      pin: true,
      pinSpacing: true,
      scrub: isSafari && isIOS ? 0.5 : 1,
      invalidateOnRefresh: true,
      refreshPriority: 6,
      onRefresh: () => {
        moveDistance = calculateDimensions();
      },
      onUpdate: (self) => {
        const progress = self.progress;
        const currentTranslateX = progress * moveDistance;

        // Animate wrapper horizontally
        gsap.set(wrapper, {
          x: currentTranslateX,
          force3D: true,
          transformOrigin: 'left center',
        });

        // Animate progress bar
        if (progressBar) {
          gsap.set(progressBar, {
            width: `${progress * 100}%`,
          });
        }
      },
    });

    // Handle resize and orientation change
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        moveDistance = calculateDimensions();
        scrollTriggerManager.requestRefresh();
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 500);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="feedback-scroll-section">
      {/* Decorative Top Bar */}
      <div className="feedback-top-bar">
        <div className="feedback-top-bar-content">
          <p className="mono">
            <span>▶</span> Client Testimonials
          </p>
          <p className="mono">/ Trust &amp; Reliability</p>
        </div>
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div ref={wrapperRef} className="feedback-scroll-wrapper">
        {customerFeedback.map((feedback, index) => (
          <div key={feedback.id} className="feedback-card">
            <div className="feedback-card-content">
              <div className="feedback-quote-icon">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <path
                    d="M15 35V25C15 18.3726 20.3726 13 27 13H28V18H27C23.134 18 20 21.134 20 25V26H25V35H15ZM37 35V25C37 18.3726 42.3726 13 49 13H50V18H49C45.134 18 42 21.134 42 25V26H47V35H37Z"
                    fill="var(--trd-accent)"
                  />
                </svg>
              </div>
              <div className="feedback-copy">
                <p>{feedback.copy}</p>
              </div>
              <div className="feedback-author">
                <h4>{feedback.author}</h4>
                <p className="mono">{feedback.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="feedback-progress-bar">
        <div ref={progressBarRef} className="progress-bar"></div>
      </div>

      {/* Decorative Bottom Bar */}
      <div className="feedback-bottom-bar">
        <div className="feedback-bottom-bar-content">
          <p className="mono">
            <span>▶</span> {customerFeedback.length} Reviews
          </p>
          <p className="mono">/ Scroll to explore</p>
        </div>
      </div>
    </section>
  );
}
