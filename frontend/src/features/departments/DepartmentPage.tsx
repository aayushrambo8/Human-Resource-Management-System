import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { departmentApi, employeeApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { initials } from '../../utils/format'

export function DepartmentPage() {
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list })
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list })
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => departments.data?.filter((department) => `${department.name} ${department.code} ${department.companyCode}`.toLowerCase().includes(search.toLowerCase())) ?? [], [departments.data, search])
  return (
    <>
      <PageHeader eyebrow="ORGANIZATION" title="Departments" description="Teams and departments across your institution." />
      <div className="list-toolbar"><label className="search-box"><Icon name="search" size={18} /><input placeholder="Find a department" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search departments" /></label><span className="result-count">{departments.data ? `${filtered.length} departments` : ''}</span></div>
      {departments.isLoading ? <LoadingState label="Loading departments" /> : departments.isError ? <ErrorState message={getErrorMessage(departments.error)} onRetry={() => void departments.refetch()} /> : filtered.length ? (
        <div className="department-grid">{filtered.map((department, index) => {
          const people = employees.data?.filter((employee) => employee.departmentId === department.id) ?? []
          return <article className="panel department-card" key={department.id}>
            <div className={`department-symbol department-symbol-${index % 4}`}><Icon name="building" size={21} /></div><button className="icon-button card-menu" aria-label={`More actions for ${department.name}`}><Icon name="dots" size={18} /></button>
            <span className="department-code">{department.companyCode} / {department.code}</span><h2>{department.name}</h2>
            <p>{people.length} {people.length === 1 ? 'person' : 'people'}</p>
            <div className="department-card-footer"><div className="avatar-stack">{people.slice(0, 4).map((employee, personIndex) => <span key={employee.id} className={`avatar avatar-${personIndex % 5}`}>{initials(`${employee.firstName} ${employee.lastName}`)}</span>)}{people.length > 4 && <b>+{people.length - 4}</b>}</div><span>View team <Icon name="chevron" size={15} /></span></div>
          </article>
        })}</div>
      ) : <section className="panel table-panel"><EmptyState title={search ? 'No matching departments' : 'No departments yet'} description={search ? 'Try another search.' : 'Departments will appear here when they’re set up for your institution.'} icon="grid" /></section>}
    </>
  )
}
