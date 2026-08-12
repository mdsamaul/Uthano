'use client';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store';

export function Toast() {
  const { toast, hideToast } = useUIStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 rounded-lg border border-border bg-white p-4 shadow-modal animate-slide-up"
      role="alert"
    >
      {icons[toast.type]}
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={hideToast}
        className="ml-2 rounded-md p-1 hover:bg-muted"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}