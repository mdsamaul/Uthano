'use client';

import { FarmFormClient } from '@/app/admin/farms/FarmFormClient';
import { usePathname } from 'next/navigation';

export default function RoleEditFarmPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 2]; // /{role}/farms/{id}/edit

  return <FarmFormClient farmId={id} />;
}