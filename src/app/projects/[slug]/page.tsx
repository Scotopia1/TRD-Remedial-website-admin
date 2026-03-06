import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProjectBySlug } from '@/lib/content-provider';
import { ProjectDetailClient } from './ProjectDetailClient';
import './project-detail.css';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | TRD Remedial',
      description: 'The requested project could not be found.',
    };
  }

  const description = project.metaDescription || `${project.tagline} - ${project.challenge.substring(0, 120)}...`;
  const title = project.metaTitle || `${project.name} | TRD Remedial Case Study`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trdremedial.com.au';
  const canonicalUrl = `${baseUrl}/projects/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: [{ url: project.heroImage, width: 1920, height: 800, alt: project.name }],
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [project.heroImage],
    },
    keywords: [
      project.serviceType,
      project.location,
      'TRD Remedial',
      'Sydney',
      'structural remediation',
      'concrete repair',
      'carbon fibre strengthening',
      'CFRP',
      ...project.category,
    ],
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
