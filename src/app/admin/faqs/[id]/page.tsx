'use client';

import { use } from 'react';
import { FAQForm } from '@/components/admin/FAQForm';

export default function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FAQForm faqId={id} />;
}
