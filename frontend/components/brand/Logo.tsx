'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ className, showText = true, textClassName }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2', className)}
      aria-label="UTHANO - From Farm to Family"
    >
      <Image
        src="/images/logo.svg"
        alt="UTHANO Logo"
        width={40}
        height={40}
        className="h-10 w-10"
        priority
      />
      {showText && (
        <span
          className={cn(
            'text-xl font-bold tracking-tight text-primary',
            textClassName
          )}
        >
          UTHANO
        </span>
      )}
    </Link>
  );
}