'use client';

import { FarmerFormClient } from '@/app/admin/farmers/FarmerFormClient';
import { usePathname } from 'next/navigation';

export default function RoleEditFarmerPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 2]; // /{role}/farmers/{id}/edit

  return <FarmerFormClient farmerId={id} />;
}