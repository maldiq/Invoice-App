import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import InvoicePDF from './components/InvoicePDF';
import ClientForm from './components/ClientForm';
import StatusReport from './components/StatusReport';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import ChangePasswordForm from './components/ChangePasswordForm';
import {
  getInvoices,
  getInvoice,
  getNextNumber,
  getReportByStatus,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from './api/invoiceApi';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from './api/clientApi';
import {
  getToken,
  getStoredUser,
  setAuth,
  clearAuth,
  getMe,
} from './api/authApi';
import { company } from './config/company';

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function pdfFileName(invoice) {
  const client = (invoice.client_name || 'klien')
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${client}-${invoice.invoice_number}.pdf`;
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [authChecking, setAuthChecking] = useState(!!getToken());
  const [view, setView] = useState('list');
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [nextNumber, setNextNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [returnView, setReturnView] = useState('list');
  const [reportData, setReportData] = useState(null);
  const [reportFilter, setReportFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authScreen, setAuthScreen] = useState(
    company.landingEnabled ? 'landing' : 'login'
  );

  const handleAuthError = (err) => {
    if (err.status === 401) {
      setUser(null);
      setInvoices([]);
      setClients([]);
      setView('list');
    }
    setError(err.message);
  };

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }

    getMe()
      .then(({ user: me }) => {
        setUser(me);
        setAuth(token, me);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadInvoices();
    loadClients();
  }, [user]);

  const handleLoginSuccess = ({ token, user: loggedUser }) => {
    setAuth(token, loggedUser);
    setUser(loggedUser);
    setError('');
    setView('list');
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setInvoices([]);
    setClients([]);
    setSelected(null);
    setEditData(null);
    setReportData(null);
    setView('list');
    setError('');
    setAuthScreen(company.landingEnabled ? 'landing' : 'login');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Memuat...
      </div>
    );
  }

  if (!user) {
    if (company.landingEnabled && authScreen === 'landing') {
      return <LandingPage onStart={() => setAuthScreen('login')} />;
    }
    return (
      <LoginPage
        onSuccess={handleLoginSuccess}
        onBack={
          company.landingEnabled
            ? () => setAuthScreen('landing')
            : undefined
        }
      />
    );
  }

  const openCreate = async () => {
    try {
      const { invoice_number } = await getNextNumber();
      setNextNumber(invoice_number);
      setEditData(null);
      setView('create');
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = async (id) => {
    try {
      const data = await getInvoice(id);
      setEditData(data);
      setView('edit');
    } catch (err) {
      setError(err.message);
    }
  };

  const openPreview = async (id) => {
    try {
      const data = await getInvoice(id);
      setSelected(data);
      setView('preview');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      if (view === 'edit' && editData) {
        await updateInvoice(editData.id, form);
      } else {
        await createInvoice(form);
      }
      await loadInvoices();
      setView('list');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const openClients = (fromView = 'list') => {
    setReturnView(fromView);
    setEditClient(null);
    setView('clients');
    loadClients();
  };

  const handleClientSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      if (editClient) {
        await updateClient(editClient.id, form);
      } else {
        await createClient(form);
      }
      await loadClients();
      setEditClient(null);
      setView('clients');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClientDelete = async (id) => {
    if (!confirm('Hapus klien ini?')) return;
    try {
      await deleteClient(id);
      await loadClients();
    } catch (err) {
      setError(err.message);
    }
  };

  const goHome = () => {
    setMenuOpen(false);
    setView('list');
  };

  const goBack = () => {
    setMenuOpen(false);
    if (returnView === 'create' || returnView === 'edit') {
      setView(returnView);
    } else {
      setView('list');
    }
  };

  const navigate = (nextView, action) => {
    setMenuOpen(false);
    if (action) action();
    else setView(nextView);
  };

  const openReport = async () => {
    try {
      const data = await getReportByStatus();
      setReportData(data);
      setReportFilter('all');
      setView('report');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goHome}
              className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors truncate"
            >
              {company.appName}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-500">{user.name}</span>
              <div className="flex gap-2 flex-wrap justify-end">
                {view === 'list' && (
                  <>
                    <button onClick={() => setView('password')} className="btn-secondary">Password</button>
                    <button onClick={openReport} className="btn-secondary">Laporan</button>
                    <button onClick={() => openClients('list')} className="btn-secondary">Klien</button>
                    <button onClick={openCreate} className="btn-primary">+ New Invoice</button>
                  </>
                )}
                {view !== 'list' && (
                  <button
                    type="button"
                    onClick={view === 'clients' || view === 'client-form' ? goBack : goHome}
                    className="btn-secondary"
                  >
                    ← Kembali
                  </button>
                )}
                <button type="button" onClick={handleLogout} className="btn-secondary">Logout</button>
              </div>
            </div>

            <button
              type="button"
              className="md:hidden btn-secondary px-3"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-gray-100 space-y-2">
              <p className="text-sm text-gray-500 px-1">{user.name}</p>
              {view === 'list' ? (
                <>
                  <button onClick={() => navigate('password')} className="btn-secondary w-full text-left">Password</button>
                  <button onClick={() => navigate(null, openReport)} className="btn-secondary w-full text-left">Laporan</button>
                  <button onClick={() => navigate(null, () => openClients('list'))} className="btn-secondary w-full text-left">Klien</button>
                  <button onClick={() => navigate(null, openCreate)} className="btn-primary w-full text-left">+ New Invoice</button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={view === 'clients' || view === 'client-form' ? goBack : goHome}
                  className="btn-secondary w-full text-left"
                >
                  ← Kembali
                </button>
              )}
              <button type="button" onClick={() => { setMenuOpen(false); handleLogout(); }} className="btn-secondary w-full text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base">
            <span className="break-words">{error}</span>
            <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {view === 'list' && (
          <div>
            {invoices.length === 0 ? (
              <div className="text-center py-16 sm:py-20 px-2">
                <p className="text-gray-500 mb-4">Belum ada invoice.</p>
                <button onClick={openCreate} className="btn-primary">Buat invoice pertama</button>
              </div>
            ) : (
              <>
                <div className="md:hidden space-y-3">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => openPreview(inv.id)}
                          className="font-medium text-blue-600 text-left break-all"
                        >
                          {inv.invoice_number}
                        </button>
                        <span className={`shrink-0 inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[inv.status] || statusStyles.draft}`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{inv.client_name}</p>
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>{formatDate(inv.date)}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(inv.total || 0)}</span>
                      </div>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => openPreview(inv.id)} className="text-sm text-blue-600">Lihat</button>
                        <button onClick={() => openEdit(inv.id)} className="text-sm text-gray-600">Edit</button>
                        <button onClick={() => handleDelete(inv.id)} className="text-sm text-red-600">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="table-wrap">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                          <th className="px-6 py-3">Invoice #</th>
                          <th className="px-6 py-3">Client</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Total</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-blue-600 cursor-pointer" onClick={() => openPreview(inv.id)}>
                              {inv.invoice_number}
                            </td>
                            <td className="px-6 py-4">{inv.client_name}</td>
                            <td className="px-6 py-4 text-gray-500">{formatDate(inv.date)}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusStyles[inv.status] || statusStyles.draft}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.total || 0)}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => openPreview(inv.id)} className="text-sm text-gray-600 hover:text-blue-600">View</button>
                              <button onClick={() => openEdit(inv.id)} className="text-sm text-gray-600 hover:text-blue-600">Edit</button>
                              <button onClick={() => handleDelete(inv.id)} className="text-sm text-gray-600 hover:text-red-600">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'create' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-6">Create Invoice</h2>
            <InvoiceForm
              initialData={{ invoice_number: nextNumber }}
              onSubmit={handleSubmit}
              onCancel={() => setView('list')}
              loading={loading}
              onManageClients={() => openClients('create')}
            />
          </div>
        )}

        {view === 'edit' && editData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-6">Edit Invoice</h2>
            <InvoiceForm
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setView('list')}
              loading={loading}
              onManageClients={() => openClients('edit')}
            />
          </div>
        )}

        {view === 'preview' && selected && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mb-4">
              <button onClick={() => openEdit(selected.id)} className="btn-secondary w-full sm:w-auto">Edit</button>
              <PDFDownloadLink
                document={<InvoicePDF invoice={selected} />}
                fileName={pdfFileName(selected)}
                className="btn-primary inline-block text-center w-full sm:w-auto"
              >
                {({ loading: pdfLoading }) => (pdfLoading ? 'Generating PDF...' : 'Download PDF')}
              </PDFDownloadLink>
            </div>
            <InvoicePreview invoice={selected} />
          </div>
        )}

        {view === 'clients' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold">Daftar Klien</h2>
              <button onClick={() => { setEditClient(null); setView('client-form'); }} className="btn-primary w-full sm:w-auto">
                + Tambah Klien
              </button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200 px-4">
                <p className="text-gray-500 mb-4">Belum ada klien.</p>
                <button onClick={() => { setEditClient(null); setView('client-form'); }} className="btn-primary">
                  Tambah klien pertama
                </button>
              </div>
            ) : (
              <>
                <div className="md:hidden space-y-3">
                  {clients.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-600 mt-1 break-all">{c.email || '—'}</p>
                      <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{c.address || '—'}</p>
                      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                        <button onClick={() => { setEditClient(c); setView('client-form'); }} className="text-sm text-blue-600">Edit</button>
                        <button onClick={() => handleClientDelete(c.id)} className="text-sm text-red-600">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="table-wrap">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                          <th className="px-6 py-3">Nama</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Alamat</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map((c) => (
                          <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{c.name}</td>
                            <td className="px-6 py-4 text-gray-600">{c.email || '—'}</td>
                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{c.address || '—'}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button onClick={() => { setEditClient(c); setView('client-form'); }} className="text-sm text-gray-600 hover:text-blue-600">Edit</button>
                              <button onClick={() => handleClientDelete(c.id)} className="text-sm text-gray-600 hover:text-red-600">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {view === 'client-form' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 max-w-2xl">
            <h2 className="text-lg font-semibold mb-6">{editClient ? 'Edit Klien' : 'Tambah Klien'}</h2>
            <ClientForm
              initialData={editClient}
              onSubmit={handleClientSubmit}
              onCancel={() => setView('clients')}
              loading={loading}
            />
          </div>
        )}

        {view === 'report' && reportData && (
          <div>
            <h2 className="text-lg font-semibold mb-4 sm:mb-6">Laporan Invoice per Status</h2>
            <StatusReport
              data={reportData}
              filter={reportFilter}
              onFilterChange={setReportFilter}
              onViewInvoice={openPreview}
            />
          </div>
        )}

        {view === 'password' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 max-w-lg">
            <h2 className="text-lg font-semibold mb-2">Update Password</h2>
            <p className="text-sm text-gray-500 mb-6 break-all">{user.email}</p>
            <ChangePasswordForm onCancel={goHome} />
          </div>
        )}
      </main>
    </div>
  );
}
