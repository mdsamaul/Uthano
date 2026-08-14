'use client';

import { Permission } from '@/types';

/**
 * Renders permissions grouped by module as checkboxes. Used for assigning
 * permissions to admins and roles. Actions are only visual UX — the backend
 * validates every permission id.
 */
export function PermissionChecklist({
  groups,
  selected,
  onChange,
}: {
  groups: Record<string, Permission[]>;
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const toggleGroup = (group: string) => {
    const ids = groups[group].map((p) => p.id);
    const allSelected = ids.every((id) => selected.includes(id));
    const others = selected.filter((id) => !ids.includes(id));
    onChange(allSelected ? others : [...others, ...ids]);
  };

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([group, perms]) => {
        const groupIds = perms.map((p) => p.id);
        const allSelected = groupIds.every((id) => selected.includes(id));
        const someSelected = groupIds.some((id) => selected.includes(id));
        return (
          <div key={group} className="rounded-lg border border-border p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={() => toggleGroup(group)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-semibold capitalize">{group.replace(/[-_]/g, ' ')}</span>
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-2">
              {perms.map((perm) => (
                <label key={perm.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(perm.id)}
                    onChange={() => toggle(perm.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-muted-foreground">{perm.name}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}