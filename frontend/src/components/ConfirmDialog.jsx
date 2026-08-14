// Reuses the app's existing .modal-backdrop / .add-modal styling so it
// matches the Add/Edit employee modal instead of looking like a separate
// visual style.
function ConfirmDialog({ title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onCancel}>
      <div className="add-modal confirm-dialog" onClick={e => e.stopPropagation()}>
        <button type="button" className="close" onClick={onCancel} aria-label="Close">×</button>
        <span className="modal-icon confirm-icon">!</span>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="outline-button" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="button" className="danger-button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
