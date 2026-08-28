import { useState, useEffect } from 'react';
import { company } from '../config/company';
import { applyLoginSeo } from '../utils/seo';

export default function LoginPage({ onSuccess, onBack }) {
  const canRegister = company.registerEnabled !== false;
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applyLoginSeo();
  }, []);

  useEffect(() => {
    if (!canRegister && mode === 'register') setMode('login');
  }, [canRegister, mode]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canRegister && mode === 'register') {
      setError('Pendaftaran ditutup. Silakan login atau hubungi admin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { login, register } = await import('../api/authApi');
      const data =
        mode === 'login'
          ? await login({ email: form.email, password: form.password })
          : await register({ name: form.name, email: form.email, password: form.password });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-teal-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 text-sm text-slate-500 hover:text-teal-800"
          >
            ← Kembali ke beranda
          </button>
        )}
        <div className="text-center mb-8">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="w-full cursor-pointer hover:opacity-90 transition-opacity"
            >
              <p className="text-sm text-teal-800/70 mb-1">{company.siteName}</p>
              <h1 className="text-3xl font-bold text-gray-900">{company.appName}</h1>
              <p className="text-gray-500 mt-2">{company.name} — {company.tagline}</p>
            </button>
          ) : (
            <>
              <p className="text-sm text-teal-800/70 mb-1">{company.siteName}</p>
              <h1 className="text-3xl font-bold text-gray-900">{company.appName}</h1>
              <p className="text-gray-500 mt-2">{company.name} — {company.tagline}</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {canRegister ? (
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
              >
                Daftar
              </button>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Login</h2>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && canRegister && (
              <div>
                <label className="label">Nama</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {mode === 'register' && canRegister && (
                <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {canRegister
            ? 'Setiap akun hanya melihat invoice & klien miliknya sendiri.'
            : 'Pendaftaran ditutup. Hubungi admin jika butuh akun baru.'}
        </p>
      </div>
    </div>
  );
}
