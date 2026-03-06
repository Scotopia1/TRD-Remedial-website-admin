'use client';

import './TeamScrollReveal.css';

import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { TeamMember } from '@/types/api';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';
import { getStableHeight } from '@/utils/deviceDetect';

gsap.registerPlugin(ScrollTrigger);

interface TeamScrollRevealProps {
  teamMembers?: TeamMember[];
}

export function TeamScrollReveal({ teamMembers: TEAM_MEMBERS = [] }: TeamScrollRevealProps) {
  const teamSectionRef = useRef<HTMLDivElement>(null);
  const entranceAnimationRef = useRef<ScrollTrigger | null>(null);
  const slideInAnimationRef = useRef<ScrollTrigger | null>(null);

  // CGMWTAUG2025 pattern: Mobile detection for conditional ScrollTrigger
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Phase 2: Animation Implementation
  useGSAP(
    () => {
      const teamSection = teamSectionRef.current;
      const teamMembers = gsap.utils.toArray('.team-member');
      const teamMemberImages = gsap.utils.toArray('.team-member-img');

      // Wait for images to load before initializing animations
      function waitForImagesToLoad(): Promise<void> {
        const images = teamSection?.querySelectorAll('img') || [];
        const imagePromises = Array.from(images).map((img: any) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to not block
          });
        });
        return Promise.all(imagePromises).then(() => {});
      }

      function initTeamAnimations() {
        // CGMWTAUG2025 pattern: Disable complex animations on mobile
        if (isMobile) {
          if (entranceAnimationRef.current)
            entranceAnimationRef.current.kill();
          if (slideInAnimationRef.current)
            slideInAnimationRef.current.kill();

          // Clear all transforms on team members
          teamMembers.forEach((member: any) => {
            gsap.set(member, { clearProps: 'all' });
            const teamMemberInitial = member.querySelector(
              '.team-member-name-initial [data-animate="initial"]'
            );
            gsap.set(teamMemberInitial, { clearProps: 'all' });
          });

          // Clear all transforms on images
          teamMemberImages.forEach((img: any) => {
            gsap.set(img, { clearProps: 'all' });
          });

          return;
        }

        // Desktop: Kill existing animations before creating new ones
        if (entranceAnimationRef.current)
          entranceAnimationRef.current.kill();
        if (slideInAnimationRef.current)
          slideInAnimationRef.current.kill();

        // Animation: Placeholder Entrance Animation
        // Triggered when section enters viewport
        entranceAnimationRef.current = ScrollTrigger.create({
          trigger: teamSection,
          start: 'top bottom', // Start when section enters viewport
          end: 'top top', // End when section reaches top
          scrub: 1, // Smooth sync with scroll
          refreshPriority: 7,
          onUpdate: (self) => {
            const progress = self.progress;

            teamMembers.forEach((member: any, index: number) => {
              // Animation timing parameters
              const entranceDelay = 0.15; // Stagger delay per member
              const entranceDuration = 0.7; // Duration of entrance animation
              const entranceStart = index * entranceDelay;
              const entranceEnd = entranceStart + entranceDuration;

              // Animate during member's entrance window
              if (progress >= entranceStart && progress <= entranceEnd) {
                const memberEntranceProgress =
                  (progress - entranceStart) / entranceDuration;

                // Slide up animation: translateY(125%) -> translateY(0%)
                const entranceY = 125 - memberEntranceProgress * 125;
                gsap.set(member, { y: 0, yPercent: entranceY });

                // Initial letter scale animation (delayed by 0.4)
                const teamMemberInitial = member.querySelector(
                  '.team-member-name-initial [data-animate="initial"]'
                );
                const initialLetterScaleDelay = 0.4;
                const initialLetterScaleProgress = Math.max(
                  0,
                  (memberEntranceProgress - initialLetterScaleDelay) /
                    (1 - initialLetterScaleDelay)
                );
                gsap.set(teamMemberInitial, {
                  scale: initialLetterScaleProgress,
                });
              } else if (progress > entranceEnd) {
                // Set final state after animation completes
                gsap.set(member, { y: 0, yPercent: 0 });
                const teamMemberInitial = member.querySelector(
                  '.team-member-name-initial [data-animate="initial"]'
                );
                gsap.set(teamMemberInitial, { scale: 1 });
              }
            });
          },
        });

        // Animation 2: Image Slide-In Animation
        // Images slide from right with scale (pinned scroll)
        slideInAnimationRef.current = ScrollTrigger.create({
          trigger: teamSection,
          start: 'top top', // Start when section is pinned at top
          end: `+=${getStableHeight() * 3}`, // 3x viewport height scroll
          pin: true, // Pin section during scroll
          scrub: 1, // Smooth sync with scroll
          refreshPriority: 7,
          onUpdate: (self) => {
            const progress = self.progress;

            teamMemberImages.forEach((img: any, index: number) => {
              // Phase A: Slide Animation
              const slideInStagger = 0.075;
              const xDuration = 0.4;
              const xStart = index * slideInStagger;
              const xEnd = xStart + xDuration;

              if (progress >= xStart && progress <= xEnd) {
                const imgProgress = (progress - xStart) / xDuration;

                // Slide from right to center
                const initialX = 300 - index * 100;
                const targetX = 0;
                const slideX = initialX + imgProgress * (targetX - initialX);

                gsap.set(img, {
                  x: `${slideX}%`,
                });
              } else if (progress > xEnd) {
                gsap.set(img, {
                  x: `0%`,
                });
              }

              // Phase B: Scale Animation
              const scaleStagger = 0.12;
              const scaleStart = 0.4 + index * scaleStagger;
              const scaleEnd = 1;

              if (progress >= scaleStart && progress <= scaleEnd) {
                const scaleProgress =
                  (progress - scaleStart) / (scaleEnd - scaleStart);
                const scaleValue = 0.75 + scaleProgress * 0.25;
                gsap.set(img, { scale: scaleValue });
              } else if (progress > scaleEnd) {
                gsap.set(img, { scale: 1 });
              }
            });
          },
        });
      }

      // Debounced resize handler
      let resizeTimer: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          initTeamAnimations();
          scrollTriggerManager.requestRefresh();
        }, 250);
      };

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Initialize animations after images have loaded
      waitForImagesToLoad().then(() => {
        initTeamAnimations();
        // Refresh ScrollTrigger after a small delay to ensure layout is settled
        setTimeout(() => {
          scrollTriggerManager.requestRefresh();
        }, 100);
      });

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (entranceAnimationRef.current)
          entranceAnimationRef.current.kill();
        if (slideInAnimationRef.current)
          slideInAnimationRef.current.kill();
      };
    },
    { scope: teamSectionRef, dependencies: [isMobile] } // Re-run when mobile state changes
  );

  // Extract first initial from each team member name
  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Consolidated Team Section - Prevents team members from splitting apart */}
      <section className="team-scroll-reveal-wrapper">
        {/* Hero Section */}
        <div className="team-hero">
          <h1>Meet The Team</h1>
        </div>

        {/* Team Reveal Section */}
        <div className="team-reveal" ref={teamSectionRef}>
          {TEAM_MEMBERS.map((member, index) => {
            return (
              <div key={member.id} className="team-member">
                {/* Large Initial Letter */}
                <div className="team-member-name-initial">
                  <span data-animate="initial">{getInitial(member.name)}</span>
                </div>

                {/* Member Image */}
                <div className="team-member-img">
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    quality={85}
                    priority={false}
                    blurDataURL={member.blurDataURL}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Outro Section */}
        <div className="team-outro">
          <h2>Building Tomorrow's Structures</h2>
        </div>
      </section>
    </>
  );
}
