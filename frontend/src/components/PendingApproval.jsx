import { useEffect, useState } from 'react';
import './PendingApproval.css';
import { getLeaveRequests, updateLeaveRequestStatus } from '../api/leaveRequests';

const TONES = ['amber', 'violet', 'blue'];

function PendingApproval({ onViewAll, onRespond }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getLeaveRequests('Pending').then(setPending).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    await updateLeaveRequestStatus(id, status);
    setPending(current => current.filter(p => p.id !== id));
    onRespond?.();
  };

  return (
    <section className="pending-card">
      <div className="card-heading">
        <div><h2>Pending approvals</h2><p>Leave requests waiting for your action</p></div>
        <span className="count">{pending.length}</span>
      </div>
      <div className="approval-list">
        {loading && <p className="approval-empty">Loading…</p>}
        {!loading && pending.length === 0 && <p className="approval-empty">Nothing pending right now.</p>}
        {!loading && pending.slice(0, 4).map((item, i) => (
          <div className="approval" key={item.id}>
            <span className={`mini-avatar ${TONES[i % TONES.length]}`}>
              {item.employee_name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')}
            </span>
            <span><b>{item.employee_name}</b><small>{item.leave_type}</small></span>
            <button aria-label={`Approve ${item.employee_name}`} onClick={() => respond(item.id, 'Approved')}>✓</button>
          </div>
        ))}
      </div>
      <button className="text-button" onClick={onViewAll}>View all requests <span>→</span></button>
    </section>
  );
}
export default PendingApproval;
