const AVATAR_COLORS = ['purple', 'blue', 'pink', 'orange', 'green'];

function colorFor(name = '') {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function initialsFor(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?';
}

function EmployeeTable({ employees = [], loading, error, query = '', onEdit, onDelete }) {
  const shown = employees.filter(e =>
    e.name?.toLowerCase().includes(query.toLowerCase()) ||
    e.department?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="table-card">
      <div className="section-head">
        <div><h2>Team members</h2><p>Manage your growing team</p></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>STATUS</th><th></th></tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="table-loading">Loading employees…</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={4} className="table-error">{error}</td></tr>
            )}
            {!loading && !error && shown.length === 0 && (
              <tr><td colSpan={4} className="table-empty">No employees found.</td></tr>
            )}
            {!loading && !error && shown.map(e => (
              <tr key={e.id}>
                <td>
                  <div className="employee-name">
                    <span className={`mini-avatar ${colorFor(e.name)}`}>{initialsFor(e.name)}</span>
                    <span><b>{e.name}</b><small>{e.position || '—'}</small></span>
                  </div>
                </td>
                <td>{e.department || '—'}</td>
                <td><span className={`status ${e.status === 'On leave' ? 'leave' : 'active'}`}><i />{e.status || 'Active'}</span></td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => onEdit?.(e)}>Edit</button>
                    <button className="row-delete" onClick={() => onDelete?.(e)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EmployeeTable;
