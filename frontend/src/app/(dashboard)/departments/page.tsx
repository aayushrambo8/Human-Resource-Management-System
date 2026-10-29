'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { Department, DepartmentRequest } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { DepartmentForm } from '@/components/forms/DepartmentForm';

export default function DepartmentsPage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  // department:read and department:write are both ADMIN/HR only — EMPLOYEE
  // would get 401 from the backend, so neither the list nor the form is
  // offered to them.
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
      // Employee rows embed departmentName, so a rename must refresh both.
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">ORGANIZATION</p>
          <h1 className="dashboard-title">Departments</h1>
        </div>
        {canWrite && (
          <div className="dashboard-actions">
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              <Icon name="plus" size={14} /> New department
            </button>
          </div>
        )}
      </header>

      <section aria-label="Departments">
        <article className="island">
          {!canRead ? (
            <EmptyState
              title="Restricted to HR & Admin"
              description="Departments are managed by HR. Contact your administrator if you need access."
              icon="building"
            />
          ) : departments.isLoading ? (
            <LoadingState label="Loading departments" />
          ) : departments.isError ? (
            <ErrorState message="Failed to load departments" onRetry={() => void departments.refetch()} />
          ) : departments.data && departments.data.length > 0 ? (
            <div className="department-grid">
              {departments.data.map((dept, index) => (
                <article key={dept.id} className="department-card">
                  <div className="department-card-head">
                    <div className={`department-symbol department-symbol-${index % 4}`}>
                      <Icon name="building" size={20} />
                    </div>
                    {canWrite && (
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Edit ${dept.name}`}
                        onClick={() => openEdit(dept)}
                      >
                        <Icon name="settings" size={16} />
                      </button>
                    )}
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

      {canWrite && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit department' : 'New department'}
          description={
            editing
              ? `Update ${editing.name} (${editing.code}).`
              : 'Departments group employees under a single company.'
          }
        >
          <DepartmentForm
            key={editing?.id ?? 'new'}
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
