import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as loginRequest } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const logout = () => {
    localStorage.removeItem('ems_token');
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const token = localStorage.getItem('ems_token');
    if (!token) {
      setCheckingSession(false);
      return;
    }
    getCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => logout())
      .finally(() => setCheckingSession(false));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await loginRequest(email, password);
    localStorage.setItem('ems_token', token);
    setUser(user);
  };

  const setSession = (token, user) => {
    localStorage.setItem('ems_token', token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setSession, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
