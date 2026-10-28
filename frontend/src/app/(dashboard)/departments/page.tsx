'use client';

import { useQuery } from '@tanstack/react-query';
import { departmentApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';

export default function DepartmentsPage() {
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">ORGANIZATION</p>
          <h1 className="dashboard-title">Departments</h1>
        </div>
      </header>

      <section aria-label="Departments">
        <article className="island">
          {departments.isLoading ? (
            <LoadingState label="Loading departments" />
          ) : departments.isError ? (
            <ErrorState message="Failed to load departments" onRetry={() => void departments.refetch()} />
          ) : departments.data && departments.data.length > 0 ? (
            <div className="department-grid">
              {departments.data.map((dept, index) => (
                <article key={dept.id} className="department-card">
                  <div className={`department-symbol department-symbol-${index % 4}`}>
                    <Icon name="building" size={20} />
                  </div>
                  <div className="department-code">{dept.code}</div>
                  <h2>{dept.name}</h2>
                  <p>{dept.companyCode}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No departments yet" description="Create your first department to organize teams." icon="building" />
          )}
        </article>
      </section>
    </div>
  );
}