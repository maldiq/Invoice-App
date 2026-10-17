import { useState } from 'react';
import { uploadLogo, deleteLogo } from '../api/settingsApi';

export default function SettingsPage({ settings, onUpdated, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await uploadLogo(file);
      onUpdated(data);
      setMessage('Logo berhasil diunggah. Preview & PDF invoice memakai logo ini.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Hapus logo?')) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const data = await deleteLogo();
      onUpdated(data);
      setMessage('Logo dihapus.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Logo perusahaan</h3>
        <p className="text-sm text-gray-500 mb-4">
          Tampil di preview invoice dan PDF. PNG, JPG, atau WEBP, maksimal 2MB.
        </p>
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt="Logo perusahaan"
            className="h-16 object-contain mb-4 bg-gray-50 border border-gray-200 rounded-lg p-2"
          />
        ) : (
          <p className="text-sm text-gray-400 mb-4">Belum ada logo.</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <label className={`btn-primary text-center cursor-pointer ${busy ? 'opacity-50' : ''}`}>
            {busy ? 'Mengunggah...' : 'Unggah logo'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} disabled={busy} />
          </label>
          {settings?.logo_url && (
            <button type="button" onClick={handleRemove} className="btn-secondary" disabled={busy}>
              Hapus logo
            </button>
          )}
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
      {message && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">{message}</div>}

      {onCancel && (
        <button type="button" onClick={onCancel} className="btn-secondary">Kembali</button>
      )}
    </div>
  );
}
