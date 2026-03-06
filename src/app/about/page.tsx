import { getTeamMembers } from '@/lib/content-provider';
import { AboutPageClient } from './AboutPageClient';
import './about.css';

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();
  return <AboutPageClient teamMembers={teamMembers} />;
}
