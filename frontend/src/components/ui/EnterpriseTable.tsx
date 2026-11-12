'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface EnterpriseTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchField?: (item: T) => string;
  filterOptions?: { label: string; value: string; filterFn: (item: T) => boolean }[];
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EnterpriseTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Filter records...',
  searchField,
  filterOptions,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display matching the criteria.',
}: EnterpriseTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering
  let filtered = data.filter((item) => {
    if (searchTerm && searchField) {
      if (!searchField(item).toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    if (activeFilter !== 'ALL' && filterOptions) {
      const option = filterOptions.find((o) => o.value === activeFilter);
      if (option && !option.filterFn(item)) return false;
    }
    return true;
  });

  // Sorting
  if (sortKey) {
    filtered = [...filtered].sort((a, b) => {
      const valA = (a as Record<string, unknown>)[sortKey];
      const valB = (b as Record<string, unknown>)[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const res = valA > valB ? 1 : -1;
      return sortDirection === 'asc' ? res : -res;
    });
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(keyExtractor)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex flex-col border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden shadow-xs transition-colors">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-faint)]">
              <Icon name="search" size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-solid)] focus:bg-[var(--surface)] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--text-faint)] hover:text-[var(--text)]"
              >
                <Icon name="close" size={12} />
              </button>
            )}
          </div>

          {filterOptions && filterOptions.length > 0 && (
            <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-0.5 rounded-lg border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  activeFilter === 'ALL'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                All
              </button>
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activeFilter === opt.value
                      ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {selectedIds.size > 0 && (
            <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-alt)] px-2.5 py-1 rounded-md border border-[var(--border)]">
              {selectedIds.size} selected
            </span>
          )}
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <th className="py-2.5 pl-4 pr-2 w-8">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--border-strong)] text-[var(--accent-solid)] focus:ring-[var(--ring)]"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2.5 px-3 select-none ${col.sortable ? 'cursor-pointer hover:text-[var(--text)]' : ''} ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[var(--accent-solid)]">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <div className="size-8 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                      <Icon name="search" size={14} />
                    </div>
                    <p className="text-xs font-medium text-[var(--text)]">{emptyTitle}</p>
                    <p className="text-[11px] text-[var(--text-muted)] max-w-sm">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`transition-colors duration-100 group ${
                      isSelected ? 'bg-[var(--surface-alt)]' : 'hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <td className="py-3 pl-4 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={() => toggleSelectRow(id)}
                        className="rounded border-[var(--border-strong)] text-[var(--accent-solid)] focus:ring-[var(--ring)]"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3 px-3 text-[var(--text)] align-middle ${col.className ?? ''}`}>
                        {col.render ? col.render(item, idx) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface)] text-[11px] text-[var(--text-muted)]">
        <span>Showing {filtered.length} of {data.length} records</span>
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span>HRMS Data Engine</span>
        </div>
      </div>
    </div>
  );
}
