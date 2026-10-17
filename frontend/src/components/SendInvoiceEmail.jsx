import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { sendInvoiceEmail } from '../api/invoiceApi';

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function SendInvoiceEmail({ invoice, logoUrl, smtpConfigured, onSent, onClose }) {
  const [to, setTo] = useState(invoice.client_email || '');
  const [subject, setSubject] = useState(`Invoice ${invoice.invoice_number}`);
  const [message, setMessage] = useState(
    `Halo ${invoice.client_name},\n\nTerlampir invoice ${invoice.invoice_number}. Mohon ditinjau dan dilunasi sesuai jatuh tempo.\n\nTerima kasih.`
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} logoUrl={logoUrl} />).toBlob();
      const pdfBase64 = await blobToBase64(blob);
      const result = await sendInvoiceEmail(invoice.id, { to, subject, message, pdfBase64 });
      onSent(result.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-1">Kirim invoice</h3>
        <p className="text-sm text-gray-500 mb-4">{invoice.invoice_number}</p>

        {!smtpConfigured && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg">
            SMTP belum dikonfigurasi. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS di backend/.env lalu restart server.
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="label">Email penerima</label>
            <input type="email" className="input" value={to} onChange={(e) => setTo(e.target.value)} required />
          </div>
          <div>
            <label className="label">Subjek</label>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="label">Pesan</label>
            <textarea className="input" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Batal</button>
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={busy || !smtpConfigured}>
              {busy ? 'Mengirim...' : 'Kirim PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
