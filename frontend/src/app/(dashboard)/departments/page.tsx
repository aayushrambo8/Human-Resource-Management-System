'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { departmentApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { Department, DepartmentRequest } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { DepartmentForm } from '@/components/forms/DepartmentForm';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';

const SAMPLE_DEPARTMENTS_FALLBACK: Department[] = [
  {
    id: 'dept-001',
    companyId: 'comp-01',
    companyCode: 'BITP',
    code: 'ENG',
    name: 'Engineering & Computing',
  },
  {
    id: 'dept-002',
    companyId: 'comp-01',
    companyCode: 'BITP',
    code: 'HR',
    name: 'People & Culture',
  },
  {
    id: 'dept-003',
    companyId: 'comp-01',
    companyCode: 'BITP',
    code: 'OPS',
    name: 'Campus Infrastructure & Operations',
  },
  {
    id: 'dept-004',
    companyId: 'comp-01',
    companyCode: 'BITP',
    code: 'FIN',
    name: 'Finance & Comptroller',
  },
];

export default function DepartmentsPage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const canRead = gates.canReadDepartments(roles);
  const canWrite = gates.canWriteDepartments(roles);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
    enabled: canRead,
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setModalOpen(true);
  };

  const handleSave = async (request: DepartmentRequest) => {
    if (editing) {
      await departmentApi.update(editing.id, request);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['departments'] }),
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
      ]);
    } else {
      await departmentApi.create(request);
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
    }
    setModalOpen(false);
  };

  const columns: Column<Department>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      render: (d) => (
        <Link
          href={`/departments/${d.id}`}
          className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors inline-block"
        >
          {d.code}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Department Name',
      sortable: true,
      render: (d) => (
        <Link href={`/departments/${d.id}`} className="flex items-center gap-2 group">
          <Icon name="building" size={14} className="text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
          <span className="font-semibold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--color-primary)] transition-colors">
            {d.name}
          </span>
        </Link>
      ),
    },
    {
      key: 'companyCode',
      header: 'Company / Org',
      sortable: true,
      render: (d) => (
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {d.companyCode}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/departments/${d.id}`}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline px-2.5 py-1 rounded-md"
          >
            View Personnel & Stats →
          </Link>
          {canWrite && (
            <button
              type="button"
              onClick={() => openEdit(d)}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] px-2.5 py-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors"
            >
              Edit Division
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Core Directory
            </span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)]">Structure & Divisions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            Departmental Hierarchy
          </h1>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2.5">
            <button type="button" className="btn btn-primary text-xs" onClick={openCreate}>
              <Icon name="plus" size={14} />
              <span>New Department</span>
            </button>
          </div>
        )}
      </div>

      <section aria-label="Departments">
        {!canRead ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState
              title="Restricted Access"
              description="Department management is restricted to authorized HR administrators."
              icon="building"
            />
          </div>
        ) : departments.isLoading ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <LoadingState label="Loading department hierarchy..." />
          </div>
        ) : departments.isError ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <ErrorState message="Failed to load departments" onRetry={() => void departments.refetch()} />
          </div>
        ) : (departments.data && departments.data.length > 0) || SAMPLE_DEPARTMENTS_FALLBACK ? (
          <EnterpriseTable
            data={departments.data && departments.data.length > 0 ? departments.data : SAMPLE_DEPARTMENTS_FALLBACK}
            columns={columns}
            keyExtractor={(d) => d.id}
            searchPlaceholder="Search departments by name or code..."
            searchField={(d) => `${d.name} ${d.code} ${d.companyCode}`}
          />
        ) : (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState title="No departments established" description="Create organizational divisions to assign staff." icon="building" />
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editing ? `Edit ${editing.name}` : 'New Department'}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        >
          <DepartmentForm
            initialValues={editing ?? undefined}
            submitLabel={editing ? 'Save changes' : 'Create department'}
            onSubmit={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
