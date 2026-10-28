'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { employeeApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, initials } from '@/lib/format';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const employee = useQuery({ queryKey: ['employee', id], queryFn: () => employeeApi.get(id), enabled: !!id });

  if (employee.isLoading) return <LoadingState label="Loading employee" />;
  if (employee.isError) return <ErrorState message="Failed to load employee" onRetry={() => void employee.refetch()} />;
  if (!employee.data) return <EmptyState title="Employee not found" description="The requested employee does not exist." icon="users" />;

  const emp = employee.data;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <Link href="/employees" className="back-link">
            <Icon name="back" size={16} /> Back to directory
          </Link>
          <h1 className="dashboard-title">{emp.firstName} {emp.lastName}</h1>
        </div>
      </header>

      <section aria-label="Employee details">
        <article className="island">
          <IslandBody className="profile-hero">
            <div className="profile-avatar" aria-hidden="true">{initials(`${emp.firstName} ${emp.lastName}`)}</div>
            <div className="profile-intro">
              <h2>{emp.firstName} {emp.lastName}</h2>
              <span>{emp.employeeCode} · {emp.departmentName ?? 'Unassigned'}</span>
            </div>
          </IslandBody>
        </article>

        <article className="island">
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
        </article>
      </section>
    </div>
  );
}

function Island({ children }: { children: React.ReactNode }) {
  return <article className="island">{children}</article>;
}

function IslandHeader({ children }: { children: React.ReactNode }) {
  return <header className="island-header" style={{ paddingBottom: 12 }}>{children}</header>;
}

function IslandBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`island-body ${className}`}>{children}</div>;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="info-row">
      <div className="info-icon"><Icon name={icon as any} size={16} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}