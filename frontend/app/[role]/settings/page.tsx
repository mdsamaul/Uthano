import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'UTHANO system settings.',
};

export default function RoleSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="p-6">
        <p className="font-medium">General Settings</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Store name, contact and delivery configuration are managed here. This section requires the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">settings.view</code> /{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">settings.update</code> permissions.
        </p>
      </Card>
    </div>
  );
}
