import './WelcomeCard.css';
import { useAuth } from '../context/AuthContext';

function WelcomeCard({ onAddEmployee }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const date = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  return <section className="welcome-card"><div><p className="eyebrow">{date}</p><h1>Good morning, {firstName} <span>👋</span></h1><p className="welcome-copy">Here’s what’s happening with your team today.</p><button onClick={onAddEmployee} className="primary-button"><b>＋</b> Add employee</button></div><div className="welcome-illustration" aria-hidden="true"><div className="sun" /><div className="person"><span className="head" /><span className="body" /></div><div className="plant">❋</div></div></section>;
}

export default WelcomeCard;
