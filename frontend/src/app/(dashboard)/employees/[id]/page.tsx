'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { EmployeeRequest } from '@/lib/types';
import { Icon, type IconName } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Island, IslandHeader, IslandBody } from '@/components/ui/Island';
import { Modal } from '@/components/ui/Modal';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { formatDate, initials } from '@/lib/format';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const canWrite = gates.canWriteEmployees(roles);
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const employee = useQuery({ queryKey: ['employee', id], queryFn: () => employeeApi.get(id), enabled: !!id });

  if (employee.isLoading) return <LoadingState label="Loading employee" />;
  if (employee.isError) return <ErrorState message="Failed to load employee" onRetry={() => void employee.refetch()} />;
  if (!employee.data) return <EmptyState title="Employee not found" description="The requested employee does not exist." icon="users" />;

  const emp = employee.data;

  const handleUpdate = async (request: EmployeeRequest) => {
    await employeeApi.update(id, request);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employee', id] }),
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
    ]);
    setEditing(false);
    setJustSaved(true);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Executive Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-2"
          >
            <Icon name="back" size={14} />
            <span>Back to People Directory</span>
          </Link>
          <h1 className="text-2xl sm:text-[34px] md:text-[42px] font-bold tracking-tight text-[var(--color-text)] font-serif leading-tight">
            {emp.firstName} {emp.lastName}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Enterprise personnel profile · Department: <span className="font-semibold text-[var(--color-text)]">{emp.departmentName ?? 'Unassigned'}</span>
          </p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary text-xs px-4 py-2"
              onClick={() => {
                setJustSaved(false);
                setEditing(true);
              }}
            >
              <Icon name="settings" size={14} />
              <span>Edit Personnel Record</span>
            </button>
          </div>
        )}
      </header>

      {justSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 shadow-xs">
          <Icon name="check-circle" size={16} />
          <span>Employee details updated and synchronized with institutional registry.</span>
        </div>
      )}

      {/* Spacious Golden Ratio Profile Display */}
      <section aria-label="Employee details" className="space-y-8">
        {/* 1. Hero Identity Banner */}
        <div className="p-8 sm:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs relative overflow-hidden">
          <div
            className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: 'var(--color-primary)' }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="size-20 sm:size-24 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-impact text-[28px] sm:text-[34px] tracking-wider shadow-md shrink-0">
              {initials(`${emp.firstName} ${emp.lastName}`)}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                <h2 className="text-xl sm:text-[26px] font-bold text-[var(--color-text)] font-serif">
                  {emp.firstName} {emp.lastName}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-impact tracking-wider border shadow-2xs self-center sm:self-auto ${
                  emp.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
                }`}>
                  <span className={`size-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  {emp.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] self-center sm:self-auto">
                  {emp.employeeCode}
                </span>
              </div>

              <p className="text-sm text-[var(--color-text-muted)]">
                {emp.departmentName ?? 'Unassigned Division'} · Enrolled {formatDate(emp.joiningDate)}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Key Personnel Attributes Grid */}
        <div className="p-8 sm:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <h3 className="text-lg sm:text-[20px] font-bold text-[var(--color-text)] font-serif">
              Employment & Contact Information
            </h3>
            <span className="text-[11px] font-mono text-[var(--color-text-muted)]">Verified Record</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <InfoRow icon="mail" label="Official Email" value={emp.email ?? '—'} />
            <InfoRow icon="phone" label="Contact Telephone" value={emp.phone ?? '—'} />
            <InfoRow icon="building" label="Assigned Department" value={emp.departmentName ?? 'Unassigned'} />
            <InfoRow
              icon="briefcase"
              label="Lifecycle Status"
              value={
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-impact tracking-wider border ${
                  emp.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
                }`}>
                  {emp.status}
                </span>
              }
            />
            <InfoRow icon="calendar" label="Date of Joining" value={formatDate(emp.joiningDate)} />
            <InfoRow
              icon="grid"
              label="Institutional Code"
              value={<span className="font-impact text-sm tracking-wider text-[var(--color-primary)]">{emp.employeeCode}</span>}
            />
          </div>
        </div>
      </section>

      {/* employee:write (ADMIN/HR) only */}
      {canWrite && (
        <Modal
          open={editing}
          onClose={() => setEditing(false)}
          title="Edit employee"
          description={`Update the directory record for ${emp.employeeCode}.`}
        >
          <EmployeeForm
            initialValues={emp}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex items-start gap-4 shadow-2xs">
      <div className="size-11 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] shrink-0 shadow-2xs">
        <Icon name={icon} size={18} />
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </span>
        <div className="text-sm sm:text-base font-semibold text-[var(--color-text)] truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
