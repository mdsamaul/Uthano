'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { farmService } from '@/services';
import { ErrorMessage } from '@/components/common/state-components';
import { MapPin, Sprout } from 'lucide-react';

export function FarmsClient() {
  const farmsQuery = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getFarms(1, 24),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Our Farms</h1>
        <p className="mt-2 text-muted-foreground">
          Meet the farms behind your fresh products
        </p>
      </div>

      {farmsQuery.isError ? (
        <ErrorMessage
          message="Farms could not be loaded."
          onRetry={() => farmsQuery.refetch()}
        />
      ) : farmsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {farmsQuery.data?.items.map((farm) => (
            <Link
              key={farm.id}
              href={`/farms/${farm.slug}`}
              className="group rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary">
                    {farm.name}
                  </h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {farm.district}
                  </p>
                </div>
              </div>
              {farm.description && (
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                  {farm.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}