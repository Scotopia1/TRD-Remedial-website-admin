'use client';

import { use } from 'react';
import { TestimonialForm } from '@/components/admin/TestimonialForm';

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TestimonialForm testimonialId={id} />;
}
