import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout({ children, page, onNavigate, pendingCount }) {
  return <div className="app-shell"><Sidebar page={page} onNavigate={onNavigate} pendingCount={pendingCount} /><div className="app-content"><Navbar page={page} /><main>{children}</main></div></div>;
}
export default Layout;
