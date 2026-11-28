'use client';

import { useState } from 'react';
import { motion, transitions } from '@/lib/motion';
import { Icon } from '@/components/ui/Icon';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-faint)]">
              <Icon name="search" size={15} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 text-xs sm:text-sm rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-solid)] focus:bg-[var(--surface)] transition-all font-serif"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-faint)] hover:text-[var(--text)] cursor-pointer"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </div>

          {filterOptions && filterOptions.length > 0 && (
            <div className="flex items-center gap-1 bg-[var(--surface-alt)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
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

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {selectedIds.size > 0 && (
            <span className="text-xs font-mono font-medium text-[var(--text-muted)] bg-[var(--surface-alt)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              {selectedIds.size} selected
            </span>
          )}
          {actions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">
              <th className="py-3.5 pl-5 pr-2 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={filtered.length > 0 && selectedIds.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--border-strong)] text-[var(--accent-solid)] focus:ring-[var(--ring)] cursor-pointer"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-4 sm:px-5 select-none ${col.align === 'right' ? 'text-right' : ''} ${col.sortable ? 'cursor-pointer hover:text-[var(--text)]' : ''} ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[var(--accent-solid)] font-bold">
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
                <td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="size-10 rounded-full bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                      <Icon name="search" size={16} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text)] font-serif text-balance">{emptyTitle}</p>
                    <p className="text-xs text-[var(--text-muted)] max-w-sm font-serif">{emptyDescription}</p>
                    {(searchTerm || activeFilter !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setActiveFilter('ALL');
                        }}
                        className="btn btn-secondary text-xs mt-1"
                      >
                        Clear active filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.has(id);
                return (
                  <motion.tr
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...transitions.entrance,
                      delay: Math.min(idx * 0.03, 0.3),
                    }}
                    className={`transition-colors duration-150 group ${
                      isSelected ? 'bg-[var(--surface-alt)]' : 'hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    <td className="py-4.5 pl-5 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Select row ${id}`}
                        checked={isSelected}
                        onChange={() => toggleSelectRow(id)}
                        className="rounded border-[var(--border-strong)] text-[var(--accent-solid)] focus:ring-[var(--ring)] cursor-pointer"
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-4.5 px-4 sm:px-5 text-[var(--text)] align-middle ${
                          col.align === 'right' ? 'text-right tabular-nums' : ''
                        } ${col.className ?? ''}`}
                      >
                        {col.render ? col.render(item, idx) : String((item as Record<string, unknown>)[col.key] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
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
