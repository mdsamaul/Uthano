'use client';

import { ProductFormClient } from '@/app/admin/products/ProductFormClient';
import { usePathname } from 'next/navigation';

export default function RoleEditProductPage() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const id = segments[segments.length - 2]; // /{role}/products/{id}/edit

  return <ProductFormClient productId={id} />;
}
