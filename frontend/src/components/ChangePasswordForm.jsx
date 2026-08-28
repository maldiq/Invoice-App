import { useState } from 'react';
import { changePassword } from '../api/authApi';

export default function ChangePasswordForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Konfirmasi password baru tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage(result.message || 'Password berhasil diubah');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onSuccess?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="label">Password Lama</label>
        <input
          type="password"
          className="input"
          value={form.currentPassword}
          onChange={(e) => set('currentPassword', e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="label">Password Baru</label>
        <input
          type="password"
          className="input"
          value={form.newPassword}
          onChange={(e) => set('newPassword', e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
      </div>
      <div>
        <label className="label">Konfirmasi Password Baru</label>
        <input
          type="password"
          className="input"
          value={form.confirmPassword}
          onChange={(e) => set('confirmPassword', e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{message}</div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">Batal</button>
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
}
