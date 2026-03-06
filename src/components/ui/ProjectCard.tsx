'use client';

import Link from 'next/link';
import { AnimatedCopy } from '@/components/animations/AnimatedCopy';
import { useStore } from '@/stores/useStore';
import type { Project } from '@/types/api';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const setCursorVariant = useStore((state) => state.setCursorVariant);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-card"
      onMouseEnter={() => setCursorVariant('link')}
      onMouseLeave={() => setCursorVariant('default')}
    >
      <div className="project-card-image">
        <img
          src={project.thumbnailImage}
          alt={project.name}
          loading="lazy"
        />
      </div>

      <div className="project-card-content">
        <AnimatedCopy
          delay={index * 0.1}
          tag="div"
          className="project-card-category"
        >
          {project.serviceType}
        </AnimatedCopy>

        <AnimatedCopy
          delay={index * 0.1 + 0.05}
          tag="h3"
          className="project-card-title"
        >
          {project.name}
        </AnimatedCopy>

        <AnimatedCopy
          delay={index * 0.1 + 0.1}
          tag="p"
          className="project-card-location"
        >
          {project.location}
        </AnimatedCopy>

        <div className="project-card-arrow">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
