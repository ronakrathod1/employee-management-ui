import { useState } from 'react';
import './Dashboard.css';
import WelcomeCard from '../components/WelcomeCard';
import PendingApproval from '../components/PendingApproval';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeGrid from '../components/EmployeeGrid';
import EmployeeFormModal from '../components/EmployeeFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

function Dashboard({ employees, loading, error, departments, onAddEmployee, onEditEmployee, onDeleteEmployee, onNavigate, onLeaveResponded }) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      await onDeleteEmployee(confirmingDelete.id);
      setConfirmingDelete(null);
    } catch {
      // The toast already surfaced the error — keep the dialog open so
      // the user can try again or cancel.
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-top">
        <WelcomeCard onAddEmployee={() => setShowForm(true)} />
        <PendingApproval onViewAll={() => onNavigate?.('Leave requests')} onRespond={onLeaveResponded} />
      </div>
      <EmployeeGrid employees={employees} />
      <section className="team-section">
        <div className="team-toolbar">
          <div className="search">
            <span>⌕</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search employees" aria-label="Search employees" />
          </div>
          <button className="filter-button">☷ <span>Filter</span></button>
        </div>
        <EmployeeTable
          employees={employees}
          loading={loading}
          error={error}
          query={query}
          onEdit={setEditing}
          onDelete={setConfirmingDelete}
        />
      </section>
      {showForm && (
        <EmployeeFormModal departments={departments} onSubmit={onAddEmployee} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <EmployeeFormModal
          employee={editing}
          departments={departments}
          onSubmit={form => onEditEmployee(editing.id, form)}
          onClose={() => setEditing(null)}
        />
      )}
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
export default Dashboard;
