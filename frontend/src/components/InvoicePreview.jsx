import { company } from '../config/company';

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
    month: 'long',
    year: 'numeric',
  });
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function InvoicePreview({ invoice }) {
  if (!invoice) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{company.name}</h2>
          <p className="text-gray-500 italic mt-0.5 text-sm sm:text-base">{company.tagline}</p>
        </div>
        <div className="sm:text-right">
          <h1 className="text-2xl sm:text-4xl font-light text-gray-400 tracking-wide">INVOICE</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</h3>
          <p className="font-semibold text-gray-900">{invoice.client_name}</p>
          {invoice.client_email && <p className="text-gray-600 break-all">{invoice.client_email}</p>}
          {invoice.client_address && <p className="text-gray-600 whitespace-pre-line">{invoice.client_address}</p>}
        </div>
        <div className="sm:text-right text-sm space-y-1">
          <p className="break-all"><span className="text-gray-500">Invoice #:</span> <span className="font-medium">{invoice.invoice_number}</span></p>
          <p><span className="text-gray-500">Date:</span> {formatDate(invoice.date)}</p>
          <p><span className="text-gray-500">Due:</span> {formatDate(invoice.due_date)}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${statusStyles[invoice.status] || statusStyles.draft}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="sm:hidden space-y-3 mb-6">
        {(invoice.items || []).map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-3">
            <p className="font-medium text-gray-900">{item.description}</p>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <div className="flex justify-between"><span>Qty</span><span>{item.quantity}</span></div>
              <div className="flex justify-between"><span>Harga</span><span>{formatCurrency(item.unit_price)}</span></div>
              <div className="flex justify-between font-medium text-gray-900"><span>Jumlah</span><span>{formatCurrency(item.quantity * item.unit_price)}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto mb-6">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
              <th className="px-4 py-3 rounded-tl-lg">Description</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right rounded-tr-lg">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.quantity * item.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-stretch sm:justify-end">
        <div className="w-full sm:w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tax ({invoice.tax_rate || 0}%)</span>
            <span>{formatCurrency(invoice.tax || 0)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-2">
            <span>Total</span>
            <span>{formatCurrency(invoice.total || 0)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      <div className="mt-10 sm:mt-12 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-700 mb-8">
          <p className="font-medium mb-1">Transfer ke rekening:</p>
          <p>{company.bank.name}</p>
          <p>Norek: {company.bank.accountNumber}</p>
          <p>A/n: {company.bank.accountHolder}</p>
        </div>
        <p className="text-center font-bold text-gray-800 tracking-wide text-sm sm:text-base">
          {company.footerMessage}
        </p>
      </div>
    </div>
  );
}
