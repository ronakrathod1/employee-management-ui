import { useState } from 'react';
import './Login.css';
import { useAuth } from '../context/AuthContext';
import { register as registerRequest } from '../api/auth';

function Login() {
  const { login, setSession } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = field => e => setForm(current => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        const { token, user } = await registerRequest(form.name, form.email, form.password);
        setSession(token, user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-panel">
        <div className="login-brand">
          <span className="brand-mark">E</span>
          <span>empower<span>HR</span></span>
        </div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your HR account'}</h1>
        <p className="login-copy">
          {mode === 'login'
            ? 'Sign in to manage your team, attendance, and leave requests.'
            : 'Set up access to the employee management workspace.'}
        </p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <label>
              <span>Full name</span>
              <input value={form.name} onChange={update('name')} placeholder="Jordan Lee" required autoFocus />
            </label>
          )}
          <label>
            <span>Work email</span>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" required autoFocus={mode === 'login'} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={update('password')} placeholder="••••••••" required minLength={mode === 'register' ? 8 : undefined} />
          </label>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="login-switch">
          {mode === 'login' ? (
            <>New to this workspace? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </p>
      </div>
      <div className="login-showcase" aria-hidden="true">
        <div className="showcase-card">
          <h2>Run HR from one place</h2>
          <p>Employees, attendance, leave, and departments — all connected to one live database.</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
