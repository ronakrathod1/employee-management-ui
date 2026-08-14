import './Toast.css';

function Toast({ message, type = 'success', onDismiss }) {
  return (
    <div className={`toast toast-${type}`} role="status">
      <span className="toast-icon">{type === 'success' ? '✓' : '!'}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

export default Toast;
