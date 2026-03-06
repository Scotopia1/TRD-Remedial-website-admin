'use client';

import './TeamCardsSticky.css';
import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { TeamMember } from '@/types/api';
import { scrollTriggerManager } from '@/utils/scrollTriggerManager';
import { getStableHeight } from '@/utils/deviceDetect';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TeamCardsStickyProps {
  teamMembers?: TeamMember[];
}

export function TeamCardsSticky({ teamMembers: TEAM_MEMBERS = [] }: TeamCardsStickyProps) {
  const stickyRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1000px)', () => {
        let scrollTriggerInstance: ScrollTrigger | null = null;

        const stickySection = stickyRef.current;
        const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];

        if (!stickySection || cards.length === 0) {
          return () => {};
        }

        const stickyHeight = getStableHeight() * 3; // Shorter scroll since we stop at center
        const totalCards = cards.length;

        // Straight line animation - cards slide from right to centered position
        function positionCards(progress = 0) {
          const viewportWidth = window.innerWidth;

          // Get actual card width from first card (respects CSS media queries)
          const cardWidth = cards[0]?.offsetWidth || 400;

          // Responsive spacing - ensure all 3 cards fit with padding
          const sidePadding = 100; // 50px on each side
          const availableWidth = viewportWidth - sidePadding;
          // Calculate spacing to evenly distribute cards
          const cardSpacing = Math.min(450, (availableWidth - cardWidth) / (totalCards - 1));

          // Calculate total group width (distance from first card center to last card center)
          const totalGroupWidth = (totalCards - 1) * cardSpacing;

          // Cards are CSS positioned at left:50% with margin-left:-halfWidth
          // So x=0 means card is centered. For group to be centered:
          // First card at -totalGroupWidth/2, last card at +totalGroupWidth/2
          const endX = -totalGroupWidth / 2;

          // Start: first card off-screen right
          const startX = viewportWidth / 2 + cardWidth;

          const totalTravel = startX - endX;

          // All cards move together at the same speed
          const baseX = startX - (progress * totalTravel);

          cards.forEach((card, i) => {
            // Each card has a fixed offset from the base position
            const cardOffset = i * cardSpacing;
            const x = baseX + cardOffset;

            // No rotation for clean straight movement
            gsap.set(card, {
              x: x,
              y: 0,
              rotation: 0,
              transformOrigin: 'center center',
            });
          });
        }

        // Initial positioning — make cards visible after GSAP has set their position
        positionCards(0);
        cards.forEach((card) => {
          gsap.set(card, { visibility: 'visible' });
        });

        scrollTriggerInstance = ScrollTrigger.create({
          trigger: stickySection,
          start: 'top top',
          end: () => `+=${stickyHeight}px`,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            positionCards(self.progress);
          },
        });

        const handleResize = () => {
          positionCards(0);
          scrollTriggerManager.requestRefresh();
        };
        window.addEventListener('resize', handleResize, { passive: true });

        // Use manager's debounced refresh to avoid redundant refresh calls
        scrollTriggerManager.requestRefresh();

        return () => {
          if (scrollTriggerInstance) scrollTriggerInstance.kill();
          window.removeEventListener('resize', handleResize);
        };
      });

      mm.add('(max-width: 999px)', () => {
        const stickySection = stickyRef.current;
        if (stickySection) gsap.set(stickySection, { clearProps: 'all' });
        cardsRef.current.forEach((card) => {
          if (card) gsap.set(card, { clearProps: 'all' });
        });

        // Use manager's debounced refresh to avoid redundant refresh calls
        scrollTriggerManager.requestRefresh();

        const refreshHandler = () => {
          scrollTriggerManager.requestRefresh();
        };

        window.addEventListener('orientationchange', refreshHandler);
        const onLoad = () => scrollTriggerManager.requestRefresh();
        window.addEventListener('load', onLoad, { passive: true });

        return () => {
          window.removeEventListener('orientationchange', refreshHandler);
          window.removeEventListener('load', onLoad);
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: stickyRef }
  );

  return (
    <>
      {/* Desktop animated section with straight line animation */}
      <section className="team-arc-section team-desktop" ref={stickyRef}>
        {/* Section Title */}
        <div className="team-title">
          <h1>Leadership<br />Team</h1>
        </div>

        {/* Cards Container */}
        <div className="cards">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              className="card"
              key={member.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
            >
              <div className="card-img">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={85}
                  priority={false}
                  placeholder={member.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={member.blurDataURL}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="card-content">
                <h3>{member.name}</h3>
                <p>{member.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile static section */}
      <section className="team-arc-section team-mobile">
        <div className="mobile-header">
          <h2>Leadership Team</h2>
        </div>
        {TEAM_MEMBERS.map((member, idx) => (
          <div className="mobile-card" key={`m-${member.id}`}>
            <div className="mobile-card-image">
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="100vw"
                quality={85}
                priority={false}
                placeholder={member.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={member.blurDataURL}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="mobile-card-content">
              <h2>{member.name}</h2>
              <p>{member.bio}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
