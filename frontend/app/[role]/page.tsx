'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';

export default function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const role = pathname.split('/')[1] || 'admin';
    router.replace(`/${role}/dashboard`);
  }, [pathname, router]);

  return null;
}
