import { getServices } from '@/lib/content-provider';
import { ServicesPageClient } from './ServicesPageClient';
import './services.css';

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesPageClient services={services} />;
}
