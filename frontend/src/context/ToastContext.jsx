import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismissToast = useCallback(id => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = nextId.current++;
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={() => dismissToast(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
