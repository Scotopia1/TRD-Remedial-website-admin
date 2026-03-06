'use client';

import { use } from 'react';
import { TeamForm } from '@/components/admin/TeamForm';

export default function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TeamForm memberId={id} />;
}
