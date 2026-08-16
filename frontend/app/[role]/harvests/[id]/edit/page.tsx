'use client';

import { HarvestFormClient } from '@/app/admin/harvests/HarvestFormClient';
import { usePathname } from 'next/navigation';

export default function RoleEditHarvestPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 2]; // /{role}/harvests/{id}/edit

  return <HarvestFormClient harvestId={id} />;
}
