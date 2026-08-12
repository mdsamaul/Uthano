'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Unauthorized } from '@/components/common/state-components';

export function ProfileClient() {
  const { user, isAuthenticated, isRestoring, logout } = useAuth();

  if (isRestoring) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Unauthorized />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Profile Information</h2>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="mt-1 font-medium">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="mt-1 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Phone</dt>
            <dd className="mt-1 font-medium">{user.phone}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd className="mt-1 font-medium capitalize">{user.role}</dd>
          </div>
        </dl>
        <Button variant="outline" className="mt-6" onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}