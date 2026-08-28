import { useState, useEffect } from 'react';
import { company } from '../config/company';
import { getClients } from '../api/clientApi';

const emptyItem = () => ({ description: '', quantity: 1, unit_price: 0 });

function today() {
  return new Date().toISOString().split('T')[0];
}

function dueDate(days = company.dueDays) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function InvoiceForm({ initialData, onSubmit, onCancel, loading, onManageClients }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [form, setForm] = useState({
    invoice_number: '',
    date: today(),
    due_date: dueDate(),
    client_name: '',
    client_email: '',
    client_address: '',
    status: 'draft',
    tax_rate: 0,
    notes: '',
    items: [emptyItem()],
  });

  useEffect(() => {
    getClients().then(setClients).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        invoice_number: initialData.invoice_number || '',
        date: initialData.date || today(),
        due_date: initialData.due_date || dueDate(),
        client_name: initialData.client_name || '',
        client_email: initialData.client_email || '',
        client_address: initialData.client_address || '',
        status: initialData.status || 'draft',
        tax_rate: initialData.tax_rate ?? 0,
        notes: initialData.notes || '',
        items: initialData.items?.length ? initialData.items : [emptyItem()],
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData?.client_name || clients.length === 0) return;
    const match = clients.find((c) => c.name === initialData.client_name);
    if (match) setSelectedClientId(String(match.id));
  }, [initialData, clients]);

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    if (!clientId) {
      setForm((f) => ({ ...f, client_name: '', client_email: '', client_address: '' }));
      return;
    }
    const client = clients.find((c) => String(c.id) === clientId);
    if (client) {
      setForm((f) => ({
        ...f,
        client_name: client.name,
        client_email: client.email || '',
        client_address: client.address || '',
      }));
    }
  };

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setItem = (index, field, value) => {
    setForm((f) => {
      const items = [...f.items];
      items[index] = { ...items[index], [field]: value };
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const tax = subtotal * (form.tax_rate / 100);
  const total = subtotal + tax;

  const formatCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Invoice Number</label>
          <input className="input bg-gray-50" value={form.invoice_number} readOnly required />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} required />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input type="date" className="input" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} required />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="label mb-0">Client</label>
          {onManageClients && (
            <button type="button" onClick={onManageClients} className="text-sm text-blue-600 hover:text-blue-800">
              + Kelola Klien
            </button>
          )}
        </div>
        <select
          className="input"
          value={selectedClientId}
          onChange={(e) => handleClientSelect(e.target.value)}
          required
        >
          <option value="">— Pilih Klien —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedClientId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="label">Client Name</label>
            <p className="text-gray-900">{form.client_name}</p>
          </div>
          <div>
            <label className="label">Client Email</label>
            <p className="text-gray-600">{form.client_email || '—'}</p>
          </div>
          {form.client_address && (
            <div className="md:col-span-2">
              <label className="label">Client Address</label>
              <p className="text-gray-600 whitespace-pre-line">{form.client_address}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label className="label">Tax Rate (%)</label>
          <input type="number" min="0" step="0.1" className="input" value={form.tax_rate} onChange={(e) => set('tax_rate', parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="label mb-0">Items</label>
          <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-end p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <div className="sm:col-span-5">
                <label className={`label ${i === 0 ? '' : 'sm:sr-only'}`}>Description</label>
                <input className="input" value={item.description} onChange={(e) => setItem(i, 'description', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <div className="sm:col-span-2">
                  <label className={`label ${i === 0 ? '' : 'sm:sr-only'}`}>Qty</label>
                  <input type="number" min="1" className="input" value={item.quantity} onChange={(e) => setItem(i, 'quantity', parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="sm:col-span-3">
                  <label className={`label ${i === 0 ? '' : 'sm:sr-only'}`}>Unit Price</label>
                  <input type="number" min="0" className="input" value={item.unit_price} onChange={(e) => setItem(i, 'unit_price', parseFloat(e.target.value) || 0)} required />
                </div>
              </div>
              <div className="sm:col-span-1 flex items-center justify-between sm:justify-end sm:pb-2">
                <span className="text-sm text-gray-500 sm:hidden">Amount</span>
                <span className="text-sm font-medium text-gray-700">{formatCurrency(item.quantity * item.unit_price)}</span>
              </div>
              <div className="sm:col-span-1 sm:pb-1 flex sm:justify-center">
                <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-600 text-sm" disabled={form.items.length <= 1}>
                  <span className="sm:hidden">Hapus item</span>
                  <span className="hidden sm:inline">✕</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-stretch sm:justify-end">
        <div className="w-full sm:w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Tax ({form.tax_rate}%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-1"><span>Total</span><span className="text-blue-600">{formatCurrency(total)}</span></div>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Payment terms, bank details, etc." />
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary w-full sm:w-auto">Cancel</button>
        )}
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
