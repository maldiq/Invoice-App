import { useState, useEffect } from 'react';

export default function ClientForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        address: initialData.address || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Client Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Client Email</label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="label">Client Address</label>
        <textarea
          className="input"
          rows={2}
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">Cancel</button>
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </form>
  );
}
