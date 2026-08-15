'use client';

import { OrderDetailClient } from '@/app/admin/orders/[id]/OrderDetailClient';
import { usePathname } from 'next/navigation';

export default function RoleOrderDetailPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 2]; // /{role}/orders/{id}

  return <OrderDetailClient orderId={id} />;
}
