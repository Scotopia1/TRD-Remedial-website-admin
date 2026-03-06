'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Project } from '@/types/api';
import { AnimatedH1 } from '@/components/animations/AnimatedH1';
import { AnimatedCopy } from '@/components/animations/AnimatedCopy';
import { useStore } from '@/stores/useStore';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsPageClientProps {
  projects: Project[];
}

export function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const setCursorVariant = useStore((state) => state.setCursorVariant);

  // GSAP Scroll-triggered card animations
  useGSAP(() => {
    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      // Set initial state
      gsap.set(card, {
        opacity: 0,
        scale: 0.75,
        y: 150,
      });

      // First card animates immediately after page load
      if (index === 0) {
        gsap.to(card, {
          duration: 0.75,
          y: 0,
          scale: 1,
          opacity: 1,
          ease: 'power3.out',
          delay: 0.5,
        });
      } else {
        // Subsequent cards animate when they enter viewport
        ScrollTrigger.create({
          trigger: card,
          start: 'top 100%',
          onEnter: () => {
            gsap.to(card, {
              duration: 0.75,
              y: 0,
              scale: 1,
              opacity: 1,
              ease: 'power3.out',
            });
          },
        });
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="projects-page">
      <div className="projects-list">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            href={`/projects/${project.slug}`}
            className="project-card"
            onMouseEnter={() => setCursorVariant('hover')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            {/* Featured Image - Ultra-wide 16:4 */}
            <div className="project-image">
              <Image
                src={project.featuredImage}
                alt={project.name}
                width={1200}
                height={300}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info Section - 2:5 Column Ratio */}
            <div className="project-info">
              {/* Left Column - Date + Service Type */}
              <div className="info-col-left">
                <p className="project-date">{project.date}</p>
                <p className="project-service">{project.serviceType}</p>
              </div>

              {/* Right Column - Name + Location */}
              <div className="info-col-right">
                <h3 className="project-name">{project.name}</h3>
                <p className="project-location">{project.location}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <section className="projects-cta">
        <AnimatedH1 animateOnScroll={true} className="projects-cta-title">
          Have a Project in Mind?
        </AnimatedH1>
        <AnimatedCopy
          animateOnScroll={true}
          delay={0.15}
          tag="p"
          className="projects-cta-description"
        >
          Let's discuss how we can bring your project to life with precision and expertise.
        </AnimatedCopy>
        <Link
          href="/contact"
          className="projects-cta-button"
          onMouseEnter={() => setCursorVariant('cta')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          Start Your Project
        </Link>
      </section>
    </div>
  );
}
