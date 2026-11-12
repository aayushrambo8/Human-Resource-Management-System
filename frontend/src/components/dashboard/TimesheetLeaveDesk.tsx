'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { leaveApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { LeaveRequest } from '@/lib/types';

interface TimesheetLeaveDeskProps {
  leaves: LeaveRequest[];
  canReview: boolean;
}

export function TimesheetLeaveDesk({ leaves, canReview }: TimesheetLeaveDeskProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  const decideMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      leaveApi.decide(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  const pending = leaves.filter((l) => l.status === 'PENDING');
  const resolved = leaves.filter((l) => l.status !== 'PENDING');
  const displayList = activeTab === 'PENDING' ? pending : resolved;

  return (
    <article className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-[var(--text)]">
              Pending Time-Off & Approvals
            </h3>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Employee leave authorization queue
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Awaiting ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'RESOLVED'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {displayList.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[var(--surface-alt)] border border-dashed border-[var(--border)] space-y-1">
            <p className="text-xs font-bold text-[var(--text)]">Queue Cleared</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              No leave requests awaiting administrative decision.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayList.map((req) => {
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-3.5 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-2 hover:bg-[var(--surface)] transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[var(--text)]">
                      {req.employeeCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                        isPending
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : isApproved
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[var(--text)] line-clamp-1">
                    {req.reason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                    <span>
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </span>

                    {canReview && isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={decideMutation.isPending}
                          onClick={() =>
                            decideMutation.mutate({ id: req.id, status: 'APPROVED' })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                          aria-label={`Approve leave for ${req.employeeCode}`}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={decideMutation.isPending}
                          onClick={() =>
                            decideMutation.mutate({ id: req.id, status: 'REJECTED' })
                          }
                          className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800 cursor-pointer transition-colors"
                          aria-label={`Reject leave for ${req.employeeCode}`}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span>Leave policies active</span>
        <Link href="/leave" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          Manage leave →
        </Link>
      </div>
    </article>
  );
}

