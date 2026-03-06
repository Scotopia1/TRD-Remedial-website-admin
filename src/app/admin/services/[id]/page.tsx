'use client';

import { use } from 'react';
import { ServiceForm } from '@/components/admin/ServiceForm';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ServiceForm serviceId={id} />;
}
