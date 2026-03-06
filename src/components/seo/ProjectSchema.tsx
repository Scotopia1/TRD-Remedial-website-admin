import type { Project } from '@/types/api';

interface ProjectSchemaProps {
  project: Project;
}

export function ProjectSchema({ project }: ProjectSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: project.name,
    description: project.metaDescription || project.challenge,
    image: project.heroImage,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://trdremedial.com.au/projects/${project.slug}`,
    },
    provider: {
      '@type': 'Organization',
      name: 'TRD Remedial',
      url: 'https://trdremedial.com.au',
      logo: 'https://trdremedial.com.au/images/logo.png',
    },
    serviceType: project.serviceType,
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: project.location.split(',')[0].trim(),
        addressRegion: 'NSW',
        addressCountry: 'AU',
      },
    },
    startDate: project.date,
    keywords: [project.serviceType, project.location, ...project.category].join(', '),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
