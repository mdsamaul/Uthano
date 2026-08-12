import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  const { current_page, last_page } = meta;

  if (last_page <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (last_page <= maxVisible) {
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, current_page - 1);
    let end = Math.min(last_page - 1, current_page + 1);

    if (current_page <= 3) {
      end = 4;
    }
    if (current_page >= last_page - 2) {
      start = last_page - 3;
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < last_page - 1) {
      pages.push('...');
    }

    pages.push(last_page);

    return pages;
  };

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page <= 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium',
              page === current_page
                ? 'bg-primary text-white'
                : 'border border-border hover:bg-muted'
            )}
            aria-current={page === current_page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page >= last_page}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}