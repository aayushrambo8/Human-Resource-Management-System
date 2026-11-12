'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { EmployeeRequest } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/States';
import { Island, IslandBody, IslandHeader } from '@/components/ui/Island';
import { EmployeeForm } from '@/components/forms/EmployeeForm';

export default function NewEmployeePage() {
  const { roles } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  // employee:write is held by ADMIN and HR only; EMPLOYEE gets 401 from the
  // backend, so the form is never offered to them.
  const canWrite = gates.canWriteEmployees(roles);

  const handleCreate = async (request: EmployeeRequest) => {
    await employeeApi.create(request);
    await queryClient.invalidateQueries({ queryKey: ['employees'] });
    router.push('/employees');
    router.refresh();
  };

  if (!canWrite) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-date">DIRECTORY</p>
            <h1 className="dashboard-title">New Employee</h1>
          </div>
        </header>
        <EmptyState
          title="Restricted to HR & Admin"
          description="Only HR and administrators can add employees to the directory."
          icon="users"
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <Link href="/employees" className="back-link">
            <Icon name="back" size={16} /> Back to directory
          </Link>
          <p className="dashboard-date">DIRECTORY</p>
          <h1 className="dashboard-title">New Employee</h1>
        </div>
      </header>

      <section aria-label="Create employee" className="max-w-4xl w-full">
        <Island>
          <IslandHeader>
            <div>
              <h2>Employee details</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Provide the essential identification, contact, and assignment information.
              </p>
            </div>
          </IslandHeader>
          <IslandBody>
            <EmployeeForm
              submitLabel="Create employee"
              onSubmit={handleCreate}
              onCancel={() => router.push('/employees')}
            />
          </IslandBody>
        </Island>
      </section>
    </div>
  );
}
