import './Navbar.css';

const items = [['▦', 'Dashboard'], ['♙', 'Employees'], ['◷', 'Attendance'], ['◫', 'Leave requests'], ['◈', 'Departments'], ['▣', 'Reports']];
function Sidebar({ page, onNavigate, pendingCount = 0 }) {
  return <aside className="sidebar"><div className="brand"><span className="brand-mark">E</span><span>empower<span>HR</span></span></div><nav>{items.map(([icon, label]) => <button key={label} onClick={() => onNavigate(label)} className={page === label ? 'active' : ''}><i>{icon}</i>{label}{label === 'Leave requests' && pendingCount > 0 && <em>{pendingCount}</em>}</button>)}</nav><div className="sidebar-bottom"><button><i>⚙</i>Settings</button><div className="help-card"><span>?</span><div><b>Need help?</b><small>Visit help center</small></div></div></div></aside>;
}
export default Sidebar;
