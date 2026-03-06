import './service-detail.css';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServiceBySlug, getProjects } from '@/lib/content-provider';
import { ServiceDetailClient } from './ServiceDetailClient';
import { ServiceSchema } from '@/components/seo/ServiceSchema';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: 'Service Not Found | TRD Remedial' };
  }

  return {
    title: `${service.title} Sydney | TRD Remedial Services`,
    description: service.tagline + ' - ' + service.description.substring(0, 120),
    keywords: [service.title, 'Sydney', 'NSW', 'concrete repair', 'structural remediation', ...(service.relatedServices || [])],
    openGraph: {
      title: service.title,
      description: service.tagline,
      images: [{ url: service.heroImage || service.visual, width: 1920, height: 1080, alt: `${service.title} in Sydney` }],
      type: 'website',
      url: `https://trdremedial.com.au/services/${service.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.tagline,
      images: [service.heroImage || service.visual],
    },
    alternates: {
      canonical: `https://trdremedial.com.au/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Fetch related projects for this service
  let relatedProjects: import('@/types/api').Project[] = [];
  if (service.relatedProjects && service.relatedProjects.length > 0) {
    const allProjects = await getProjects();
    relatedProjects = allProjects.filter(p =>
      service.relatedProjects!.includes(p.id) || service.relatedProjects!.includes(p.slug)
    );
  }

  return (
    <>
      <ServiceSchema service={service} />
      <ServiceDetailClient service={service} relatedProjects={relatedProjects} />
    </>
  );
}
