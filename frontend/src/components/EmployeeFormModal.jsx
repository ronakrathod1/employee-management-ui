import { useState } from 'react';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared Create/Edit form. Pass `employee` to edit an existing record,
// or omit it to create a new one. `departments` populates the dropdown.
function EmployeeFormModal({ employee, departments = [], onSubmit, onClose }) {
  const isEditing = Boolean(employee);
  const [form, setForm] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    position: employee?.position || '',
    department_id: employee?.department_id ? String(employee.department_id) : ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = field => e => setForm(current => ({ ...current, [field]: e.target.value }));

  const validate = ({ name, email }) => {
    if (!name) return 'Please enter the employee\u2019s name.';
    if (!email) return 'Please enter a work email.';
    if (!EMAIL_PATTERN.test(email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (saving) return; // guards against a double click firing two submits

    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      department_id: form.department_id ? Number(form.department_id) : null
    };

    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      // The backend already sends a clear, user-facing message for
      // duplicate emails (409) and invalid input (400) — surface it as-is
      // rather than a generic fallback, and keep the form open so the
      // user can just fix the email.
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form className="add-modal" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <button type="button" className="close" onClick={onClose} aria-label="Close">×</button>
        <span className="modal-icon">♙</span>
        <h2>{isEditing ? 'Edit team member' : 'Add a team member'}</h2>
        <p>{isEditing ? "Update this employee's information." : 'Invite a new employee to your workspace.'}</p>
        {error && (
          <p className="modal-error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}
        <label className="field-label">
          Full name<span aria-hidden="true"> *</span>
          <input placeholder="Full name" value={form.name} onChange={update('name')} autoFocus required />
        </label>
        <label className="field-label">
          Work email<span aria-hidden="true"> *</span>
          <input placeholder="Work email" type="email" value={form.email} onChange={update('email')} required />
        </label>
        <label className="field-label">
          Position
          <input placeholder="Position" value={form.position} onChange={update('position')} />
        </label>
        <label className="field-label">
          Department
          <select value={form.department_id} onChange={update('department_id')}>
            <option value="">No department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Send invitation'}
        </button>
      </form>
    </div>
  );
}

export default EmployeeFormModal;
