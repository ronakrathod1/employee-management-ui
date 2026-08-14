import { useState } from 'react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function initialsFor(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?';
}

function Navbar({ page }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <button className="mobile-menu" aria-label="Open menu">☰</button>
      <div className="breadcrumb"><span>Overview</span><b>{page}</b></div>
      <div className="nav-actions">
        <button className="icon-button" aria-label="Notifications">♧<i /></button>
        <div className="user-menu" onClick={() => setMenuOpen(open => !open)}>
          <span className="avatar">{initialsFor(user?.name)}</span>
          <span><strong>{user?.name}</strong><small>{user?.role === 'admin' ? 'Administrator' : 'HR Staff'}</small></span>
          <span className="chevron">⌄</span>
          {menuOpen && (
            <div className="user-dropdown" onClick={e => e.stopPropagation()}>
              <button onClick={logout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default Navbar;
