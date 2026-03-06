import { getProjects } from '@/lib/content-provider';
import { ProjectsPageClient } from './ProjectsPageClient';
import './projects.css';

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsPageClient projects={projects} />;
}
