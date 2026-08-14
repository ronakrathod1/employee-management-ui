import { useEffect, useMemo, useState } from 'react';
import './ManagementPage.css';
import EmployeeFormModal from '../components/EmployeeFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { getAttendance, markAttendance } from '../api/attendance';
import { createLeaveRequest, getLeaveRequests, updateLeaveRequestStatus } from '../api/leaveRequests';

const AVATAR_COLORS = ['purple', 'blue', 'pink', 'orange', 'green'];
function colorFor(name = '') { const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0); return AVATAR_COLORS[sum % AVATAR_COLORS.length]; }
function initialsFor(name = '') { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?'; }
function todayISO() { return new Date().toISOString().slice(0, 10); }

function Person({ name, sub }) { return <div className="person"><span className={`mini-avatar ${colorFor(name)}`}>{initialsFor(name)}</span><span><b>{name}</b><small>{sub}</small></span></div>; }
function Header({ title, description, action, onAction }) { return <div className="page-header"><div><p className="page-kicker">WORKSPACE / {title.toUpperCase()}</p><h1>{title}</h1><p>{description}</p></div>{action && <button className="solid-button" onClick={onAction}>＋ {action}</button>}</div>; }
function Search({ value, onChange, placeholder = 'Search' }) { return <div className="page-search"><span>⌕</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>; }
function Metric({ icon, label, value, note, tone }) { return <article className="page-metric"><span className={`page-metric-icon ${tone}`}>{icon}</span><div><p>{label}</p><h3>{value}</h3></div>{note && <small className={`metric-note ${tone}`}>{note}</small>}</article>; }
function Badge({ text, kind }) { return <span className={`page-badge ${kind}`}><i />{text}</span>; }
function Table({ headers, children }) { return <div className="management-table"><table><thead><tr>{headers.map(x => <th key={x}>{x}</th>)}<th /></tr></thead><tbody>{children}</tbody></table></div>; }
function EmptyRow({ span, children, tone }) { return <tr><td colSpan={span} className={tone === 'error' ? 'table-error' : 'table-empty'}>{children}</td></tr>; }

// ---------------------------------------------------------------- Employees
function Employees({ employees = [], loading, error, departments = [], onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const result = useMemo(() => employees.filter(e => `${e.name} ${e.position || ''} ${e.department || ''}`.toLowerCase().includes(query.toLowerCase())), [employees, query]);
  const onLeave = employees.filter(e => e.status === 'On leave').length;

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await onDelete(confirmingDelete.id);
      setConfirmingDelete(null);
    } catch {
      // toast already surfaced the error; keep the dialog open to retry/cancel
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="management-page">
      <Header title="Employees" description="Manage your team members and their information." action="Add employee" onAction={() => setShowForm(true)} />
      <div className="summary-row">
        <Metric icon="♙" label="Total employees" value={String(employees.length)} tone="purple" />
        <Metric icon="●" label="Active employees" value={String(employees.length - onLeave)} tone="green" />
        <Metric icon="◫" label="On leave" value={String(onLeave)} tone="orange" />
      </div>
      <section className="content-card">
        <div className="card-tools"><Search value={query} onChange={setQuery} placeholder="Search employees" /></div>
        <div className="list-title"><div><h2>All employees</h2><p>{result.length} team members found</p></div></div>
        <Table headers={['EMPLOYEE', 'DEPARTMENT', 'STATUS']}>
          {loading && <EmptyRow span={4}>Loading employees…</EmptyRow>}
          {!loading && error && <EmptyRow span={4} tone="error">{error}</EmptyRow>}
          {!loading && !error && result.length === 0 && <EmptyRow span={4}>No employees found.</EmptyRow>}
          {!loading && !error && result.map(e => (
            <tr key={e.id}>
              <td><Person name={e.name} sub={e.position || '—'} /></td>
              <td>{e.department || '—'}</td>
              <td><Badge text={e.status || 'Active'} kind={e.status === 'On leave' ? 'warning' : 'success'} /></td>
              <td>
                <div className="row-actions">
                  <button onClick={() => setEditing(e)}>Edit</button>
                  <button className="row-delete" onClick={() => setConfirmingDelete(e)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </section>
      {showForm && <EmployeeFormModal departments={departments} onSubmit={onAdd} onClose={() => setShowForm(false)} />}
      {editing && <EmployeeFormModal employee={editing} departments={departments} onSubmit={form => onEdit(editing.id, form)} onClose={() => setEditing(null)} />}
      {confirmingDelete && (
        <ConfirmDialog
          title="Remove employee"
          message={`Are you sure you want to remove ${confirmingDelete.name} from the team? This can't be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmingDelete(null)}
        />
      )}
    </div>
  );
}

// --------------------------------------------------------------- Attendance
function Attendance({ employees = [] }) {
  const [date, setDate] = useState(todayISO());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getAttendance(date)
      .then(res => setRecords(res.records))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [date]);

  const setStatus = async (employeeId, status) => {
    const now = new Date().toTimeString().slice(0, 5);
    await markAttendance({
      employee_id: employeeId,
      date,
      status,
      check_in: status === 'Present' ? now : null,
      check_out: null
    });
    load();
  };

  const present = records.filter(r => r.status === 'Present').length;
  const onLeave = records.filter(r => r.status === 'Leave').length;
  const unmarked = records.filter(r => !r.status).length;

  return (
    <div className="management-page">
      <Header title="Attendance" description="Track attendance and working hours for your team." />
      <div className="summary-row">
        <Metric icon="✓" label="Present" value={String(present)} tone="green" />
        <Metric icon="◫" label="On leave" value={String(onLeave)} tone="orange" />
        <Metric icon="○" label="Not marked" value={String(unmarked)} tone="purple" />
      </div>
      <section className="content-card">
        <div className="attendance-tools">
          <div className="list-title" style={{ marginBottom: 0 }}><div><h2>Attendance for {date}</h2><p>{employees.length} team members</p></div></div>
          <input className="date-input" type="date" value={date} onChange={e => setDate(e.target.value)} max={todayISO()} />
        </div>
        <Table headers={['EMPLOYEE', 'DEPARTMENT', 'STATUS']}>
          {loading && <EmptyRow span={4}>Loading attendance…</EmptyRow>}
          {!loading && error && <EmptyRow span={4} tone="error">{error}</EmptyRow>}
          {!loading && !error && records.length === 0 && <EmptyRow span={4}>No employees to track yet.</EmptyRow>}
          {!loading && !error && records.map(r => (
            <tr key={r.employee_id}>
              <td><Person name={r.name} sub={r.position || '—'} /></td>
              <td>{r.department || '—'}</td>
              <td><Badge text={r.status || 'Not marked'} kind={r.status === 'Present' ? 'success' : r.status ? 'warning' : 'neutral'} /></td>
              <td>
                <div className="row-actions">
                  <button onClick={() => setStatus(r.employee_id, 'Present')}>Present</button>
                  <button onClick={() => setStatus(r.employee_id, 'Absent')}>Absent</button>
                  <button onClick={() => setStatus(r.employee_id, 'Leave')}>Leave</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  );
}

// ---------------------------------------------------------- Leave requests
function NewLeaveRequestModal({ employees, onSubmit, onClose }) {
  const [form, setForm] = useState({ employee_id: employees[0]?.id || '', leave_type: 'Annual leave', start_date: todayISO(), end_date: todayISO(), reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = field => e => setForm(current => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...form, employee_id: Number(form.employee_id) });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form className="add-modal" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        <span className="modal-icon">◫</span>
        <h2>New leave request</h2>
        <p>File a leave request on behalf of a team member.</p>
        {error && <p className="modal-error">{error}</p>}
        <select value={form.employee_id} onChange={update('employee_id')} required>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={form.leave_type} onChange={update('leave_type')}>
          <option>Annual leave</option>
          <option>Sick leave</option>
          <option>Casual leave</option>
        </select>
        <input type="date" value={form.start_date} onChange={update('start_date')} required />
        <input type="date" value={form.end_date} onChange={update('end_date')} required />
        <input placeholder="Reason (optional)" value={form.reason} onChange={update('reason')} />
        <button className="primary-button" type="submit" disabled={saving || !form.employee_id}>{saving ? 'Saving…' : 'Submit request'}</button>
      </form>
    </div>
  );
}

function LeaveRequests({ employees = [], onLeaveResponded }) {
  const [filter, setFilter] = useState('All requests');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getLeaveRequests().then(setRequests).catch(err => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    await updateLeaveRequestStatus(id, status);
    load();
    onLeaveResponded?.();
  };

  const filtered = filter === 'All requests' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="management-page">
      <Header title="Leave requests" description="Review and manage leave requests from your team." action="New request" onAction={() => setShowForm(true)} />
      <div className="leave-layout">
        <section className="content-card">
          <div className="card-tools"><div className="tabs">{['All requests', 'Pending', 'Approved', 'Rejected'].map(x => <button onClick={() => setFilter(x)} className={filter === x ? 'selected' : ''} key={x}>{x}</button>)}</div></div>
          <div className="request-list">
            {loading && <p className="approval-empty">Loading…</p>}
            {!loading && error && <p className="approval-empty">{error}</p>}
            {!loading && !error && filtered.length === 0 && <p className="approval-empty">No requests here.</p>}
            {!loading && !error && filtered.map(item => (
              <article className="request" key={item.id}>
                <span className={`mini-avatar ${colorFor(item.employee_name)}`}>{initialsFor(item.employee_name)}</span>
                <div className="request-main"><b>{item.employee_name}</b><span>{item.leave_type} · {item.start_date} — {item.end_date}</span></div>
                <Badge text={item.status} kind={item.status === 'Pending' ? 'warning' : item.status === 'Approved' ? 'success' : 'neutral'} />
                {item.status === 'Pending' && <div className="request-actions"><button className="approve" onClick={() => respond(item.id, 'Approved')}>✓</button><button className="reject" onClick={() => respond(item.id, 'Rejected')}>×</button></div>}
              </article>
            ))}
          </div>
        </section>
        <aside className="leave-summary">
          <h2>Leave overview</h2>
          <p>All-time totals</p>
          <div className="leave-key">
            <span>Pending <b>{requests.filter(r => r.status === 'Pending').length}</b></span>
            <span>Approved <b>{requests.filter(r => r.status === 'Approved').length}</b></span>
            <span>Rejected <b>{requests.filter(r => r.status === 'Rejected').length}</b></span>
          </div>
        </aside>
      </div>
      {showForm && <NewLeaveRequestModal employees={employees} onSubmit={async form => { await createLeaveRequest(form); load(); onLeaveResponded?.(); }} onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------Departments
function NewDepartmentModal({ onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(name);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form className="add-modal" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        <span className="modal-icon">◈</span>
        <h2>Add department</h2>
        <p>Create a new department to organize your team.</p>
        {error && <p className="modal-error">{error}</p>}
        <input placeholder="Department name" value={name} onChange={e => setName(e.target.value)} autoFocus required />
        <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add department'}</button>
      </form>
    </div>
  );
}

function Departments({ departments = [], loadingDepartments, onAddDepartment, onDeleteDepartment }) {
  const [showForm, setShowForm] = useState(false);

  const handleDelete = dept => { if (window.confirm(`Delete the ${dept.name} department? Employees in it will become unassigned.`)) onDeleteDepartment(dept.id); };

  return (
    <div className="management-page">
      <Header title="Departments" description="Organize teams and department structures." action="Add department" onAction={() => setShowForm(true)} />
      <div className="department-top">
        <Metric icon="◈" label="Total departments" value={String(departments.length)} tone="purple" />
      </div>
      <div className="department-grid">
        {loadingDepartments && <p className="table-loading">Loading departments…</p>}
        {!loadingDepartments && departments.length === 0 && <p className="table-empty">No departments yet — add one to get started.</p>}
        {!loadingDepartments && departments.map((d, i) => (
          <article className="department-card" key={d.id}>
            <div className="department-card-top">
              <span className={`department-icon ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>◈</span>
              <button className="row-more" onClick={() => handleDelete(d)} aria-label={`Delete ${d.name}`}>Delete</button>
            </div>
            <h2>{d.name}</h2>
            <p>{d.employee_count} team member{d.employee_count === 1 ? '' : 's'}</p>
          </article>
        ))}
      </div>
      {showForm && <NewDepartmentModal onSubmit={onAddDepartment} onClose={() => setShowForm(false)} />}
    </div>
  );
}

// -------------------------------------------------------------------Reports
function Reports({ employees = [] }) {
  const byDept = useMemo(() => { const map = new Map(); employees.forEach(e => { const d = e.department || 'Unassigned'; map.set(d, (map.get(d) || 0) + 1); }); return [...map.entries()]; }, [employees]);
  return (
    <div className="management-page">
      <Header title="Reports" description="Get useful insights about your people and workplace." />
      <div className="summary-row">
        <Metric icon="◫" label="Total headcount" value={String(employees.length)} tone="purple" />
        <Metric icon="◈" label="Departments represented" value={String(byDept.length)} tone="blue" />
        <Metric icon="◷" label="On leave today" value={String(employees.filter(e => e.status === 'On leave').length)} tone="green" />
      </div>
      <section className="content-card report-card">
        <div className="list-title"><div><h2>Headcount by department</h2><p>Live counts pulled from your employee records</p></div></div>
        <div className="report-list">
          {byDept.map(([name, count]) => (
            <article key={name}>
              <span className="report-icon blue">◈</span>
              <div><h3>{name}</h3><p>{count} employee{count === 1 ? '' : 's'}</p></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ManagementPage(props) {
  const { type } = props;
  return ({
    Employees: <Employees {...props} />,
    Attendance: <Attendance {...props} />,
    'Leave requests': <LeaveRequests {...props} />,
    Departments: <Departments {...props} />,
    Reports: <Reports {...props} />
  })[type];
}
