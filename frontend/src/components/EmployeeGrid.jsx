import EmployeeCard from './EmployeeCard';

function EmployeeGrid({ employees = [] }) {
  const onLeave = employees.filter(e => e.status === 'On leave').length;
  return (
    <section className="stats-grid">
      <EmployeeCard icon="♙" label="Total employees" value={String(employees.length)} change="live" color="purple" />
      <EmployeeCard icon="◷" label="Active today" value={String(employees.length - onLeave)} change="live" color="blue" />
      <EmployeeCard icon="◫" label="On leave" value={String(onLeave)} change="live" color="orange" />
      <EmployeeCard icon="◈" label="Departments" value="—" change="see tab" color="green" />
    </section>
  );
}
export default EmployeeGrid;
