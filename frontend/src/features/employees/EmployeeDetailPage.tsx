import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { ErrorState, LoadingState } from '../../components/States'
import { formatDate, initials } from '../../utils/format'

export function EmployeeDetailPage() {
  const { id = '' } = useParams()
  const query = useQuery({ queryKey: ['employee', id], queryFn: () => employeeApi.get(id), enabled: Boolean(id) })
  const employee = query.data
  if (query.isLoading) return <><PageHeader title="Employee profile" /><LoadingState label="Loading employee profile" /></>
  if (query.isError || !employee) return <><PageHeader title="Employee profile" /><ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /><Link className="back-link" to="/employees"><Icon name="back" size={17} /> Back to employees</Link></>

  const fullName = `${employee.firstName} ${employee.lastName}`
  return (
    <>
      <Link className="back-link" to="/employees"><Icon name="back" size={17} /> All employees</Link>
      <PageHeader eyebrow={`EMPLOYEE ID · ${employee.employeeCode}`} title={fullName} description="Employee profile and work information." action={<button className="button button-light"><Icon name="dots" size={18} /> More actions</button>} />
      <section className="profile-hero panel">
        <div className="profile-avatar">{initials(fullName)}</div>
        <div className="profile-intro"><h2>{fullName}</h2><span>{employee.departmentName ?? 'Department not assigned'}</span><div className="profile-chips"><span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}><i />{employee.status}</span><span className="profile-code">{employee.employeeCode}</span></div></div>
        <button className="button button-light profile-edit">Edit profile</button>
      </section>
      <div className="profile-grid">
        <section className="panel info-panel"><div className="panel-heading"><div><span className="panel-eyebrow">EMPLOYMENT</span><h2>Work details</h2></div></div>
          <InfoRow label="Employee ID" value={employee.employeeCode} icon="briefcase" />
          <InfoRow label="Department" value={employee.departmentName ?? 'Not assigned'} icon="building" />
          <InfoRow label="Joining date" value={formatDate(employee.joiningDate)} icon="calendar" />
          <InfoRow label="Employment status" value={employee.status} icon="check" />
        </section>
        <section className="panel info-panel"><div className="panel-heading"><div><span className="panel-eyebrow">CONTACT</span><h2>Contact information</h2></div></div>
          <InfoRow label="Work email" value={employee.email ?? 'Not provided'} icon="mail" />
          <InfoRow label="Phone number" value={employee.phone ?? 'Not provided'} icon="phone" />
        </section>
      </div>
    </>
  )
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: 'briefcase' | 'building' | 'calendar' | 'check' | 'mail' | 'phone' }) {
  return <div className="info-row"><span className="info-icon"><Icon name={icon} size={17} /></span><div><span>{label}</span><strong>{value}</strong></div></div>
}
