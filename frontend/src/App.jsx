import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ManagementPage from './pages/ManagementPage';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from './api/employees';
import { createDepartment, deleteDepartment, getDepartments } from './api/departments';
import { getLeaveRequests } from './api/leaveRequests';
import './App.css';

function App() {
  const { user, checkingSession } = useAuth();
  const { showToast } = useToast();
  const [page, setPage] = useState('Dashboard');

  const [employees, setEmployees] = useState([]);
  const [employeesError, setEmployeesError] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [pendingCount, setPendingCount] = useState(0);
  const refreshPendingCount = () => {
    getLeaveRequests('Pending').then(list => setPendingCount(list.length)).catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    setLoadingEmployees(true);
    getEmployees().then(setEmployees).catch(err => setEmployeesError(err.message)).finally(() => setLoadingEmployees(false));
    setLoadingDepartments(true);
    getDepartments().then(setDepartments).catch(() => {}).finally(() => setLoadingDepartments(false));
    refreshPendingCount();
  }, [user]);

  if (checkingSession) {
    return <div className="app-loading">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  const addEmployee = async employee => {
    const added = await createEmployee(employee);
    setEmployees(current => [...current, added]);
    showToast('Employee added successfully.', 'success');
  };

  const editEmployee = async (id, employee) => {
    const updated = await updateEmployee(id, employee);
    setEmployees(current => current.map(e => (e.id === updated.id ? updated : e)));
    showToast('Employee updated successfully.', 'success');
  };

  const removeEmployee = async id => {
    try {
      await deleteEmployee(id);
      setEmployees(current => current.filter(e => e.id !== id));
      showToast('Employee deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not delete this employee. Please try again.', 'error');
      throw err;
    }
  };

  const addDepartment = async name => {
    const added = await createDepartment(name);
    setDepartments(current => [...current, added]);
  };

  const removeDepartment = async id => {
    await deleteDepartment(id);
    setDepartments(current => current.filter(d => d.id !== id));
  };

  const employeeProps = {
    employees,
    loading: loadingEmployees,
    error: employeesError,
    departments,
    onAdd: addEmployee,
    onEdit: editEmployee,
    onDelete: removeEmployee
  };

  const pages = {
    Dashboard: (
      <Dashboard
        employees={employees}
        loading={loadingEmployees}
        error={employeesError}
        departments={departments}
        onAddEmployee={addEmployee}
        onEditEmployee={editEmployee}
        onDeleteEmployee={removeEmployee}
        onNavigate={setPage}
        onLeaveResponded={refreshPendingCount}
      />
    ),
    Employees: <ManagementPage type="Employees" {...employeeProps} />,
    Attendance: <ManagementPage type="Attendance" employees={employees} />,
    'Leave requests': <ManagementPage type="Leave requests" employees={employees} onLeaveResponded={refreshPendingCount} />,
    Departments: (
      <ManagementPage
        type="Departments"
        employees={employees}
        departments={departments}
        loadingDepartments={loadingDepartments}
        onAddDepartment={addDepartment}
        onDeleteDepartment={removeDepartment}
      />
    ),
    Reports: <ManagementPage type="Reports" employees={employees} />
  };

  return <Layout page={page} onNavigate={setPage} pendingCount={pendingCount}>{pages[page]}</Layout>;
}
export default App;
