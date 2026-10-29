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
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <Link href="/employees" className="back-link">
            <Icon name="back" size={16} /> Back to directory
          </Link>
          <h1 className="dashboard-title">{emp.firstName} {emp.lastName}</h1>
        </div>
        {canWrite && (
          <div className="dashboard-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setJustSaved(false);
                setEditing(true);
              }}
            >
              <Icon name="settings" size={14} /> Edit employee
            </button>
          </div>
        )}
      </header>

      {justSaved && (
        <div className="alert alert-success" role="status">
          <Icon name="info" size={16} />
          <span>Employee details saved.</span>
        </div>
      )}

      <section aria-label="Employee details">
        <Island>
          <IslandBody className="profile-hero">
            <div className="profile-avatar" aria-hidden="true">{initials(`${emp.firstName} ${emp.lastName}`)}</div>
            <div className="profile-intro">
              <h2>{emp.firstName} {emp.lastName}</h2>
              <span>{emp.employeeCode} · {emp.departmentName ?? 'Unassigned'}</span>
            </div>
          </IslandBody>
        </Island>

        <Island>
          <IslandHeader>
            <h2>Details</h2>
          </IslandHeader>
          <IslandBody className="profile-grid">
            <InfoRow icon="mail" label="Email" value={emp.email ?? '—'} />
            <InfoRow icon="phone" label="Phone" value={emp.phone ?? '—'} />
            <InfoRow icon="building" label="Department" value={emp.departmentName ?? 'Unassigned'} />
            <InfoRow icon="briefcase" label="Status" value={<span className={`status-badge ${emp.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}><i aria-hidden="true" />{emp.status}</span>} />
            <InfoRow icon="calendar" label="Joined" value={formatDate(emp.joiningDate)} />
            <InfoRow icon="grid" label="Employee Code" value={emp.employeeCode} />
          </IslandBody>
        </Island>
      </section>

      {/* employee:write (ADMIN/HR) only — EMPLOYEE never sees the button, and
          the backend rejects the PUT independently. */}
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
    <div className="info-row">
      <div className="info-icon"><Icon name={icon} size={16} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
