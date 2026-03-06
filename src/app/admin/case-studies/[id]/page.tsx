'use client';

import { use } from 'react';
import { CaseStudyForm } from '@/components/admin/CaseStudyForm';

export default function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CaseStudyForm caseStudyId={id} />;
}
