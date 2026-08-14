function EmployeeCard({ icon, label, value, change, color }) { return <article className="stat-card"><span className={`stat-icon ${color}`}>{icon}</span><div><p>{label}</p><h3>{value}</h3></div><span className={`stat-change ${color}`}>↗ {change}</span></article>; }
export default EmployeeCard;
