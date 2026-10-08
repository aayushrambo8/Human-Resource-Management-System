import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { formatDate, initials } from '../../utils/format'

export function EmployeeListPage() {
  const query = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const filtered = useMemo(() => query.data?.filter((employee) => {
    const term = search.toLowerCase()
    const matchesSearch = !term || `${employee.firstName} ${employee.lastName} ${employee.employeeCode} ${employee.email ?? ''}`.toLowerCase().includes(term)
    return matchesSearch && (status === 'ALL' || employee.status === status)
  }) ?? [], [query.data, search, status])

  return (
    <>
      <PageHeader eyebrow="PEOPLE DIRECTORY" title="Employees" description="A complete view of the people who make your institution work." />
      <div className="list-toolbar">
        <label className="search-box"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, ID or email" aria-label="Search employees" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><Icon name="close" size={15} /></button>}</label>
        <label className="select-wrap"><Icon name="filter" size={17} /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        <span className="result-count">{query.data ? `${filtered.length} ${filtered.length === 1 ? 'employee' : 'employees'}` : ''}</span>
      </div>
      <section className="panel table-panel">
        {query.isLoading ? <LoadingState label="Loading employee directory" /> : query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : filtered.length ? (
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>WORK EMAIL</th><th>PHONE</th><th>STATUS</th><th>JOINED</th><th /></tr></thead>
            <tbody>{filtered.map((employee, index) => (
              <tr key={employee.id}>
                <td><Link className="person-cell" to={`/employees/${employee.id}`}><span className={`avatar avatar-${index % 5}`}>{initials(`${employee.firstName} ${employee.lastName}`)}</span><span><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.employeeCode}</small></span></Link></td>
                <td>{employee.departmentName ?? 'Unassigned'}</td><td className="muted-cell">{employee.email ?? '—'}</td><td className="muted-cell">{employee.phone ?? '—'}</td>
                <td><span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}><i />{employee.status}</span></td><td>{formatDate(employee.joiningDate)}</td>
                <td><Link className="row-arrow" to={`/employees/${employee.id}`} aria-label={`View ${employee.firstName} ${employee.lastName}`}><Icon name="chevron" size={16} /></Link></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState title={search || status !== 'ALL' ? 'No matching employees' : 'No employees yet'} description={search || status !== 'ALL' ? 'Try changing your search or filters.' : 'Employee profiles will appear here when they’re added.'} icon="users" />}
      </section>
    </>
  )
}
