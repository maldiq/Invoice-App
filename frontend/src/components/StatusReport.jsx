const statusLabels = {
  draft: 'Draft',
  sent: 'Terkirim',
  paid: 'Lunas',
  overdue: 'Jatuh Tempo',
};

const badgeStyles = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const cardAccent = {
  draft: 'border-l-gray-400',
  sent: 'border-l-blue-500',
  paid: 'border-l-green-500',
  overdue: 'border-l-red-500',
};

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

export default function StatusReport({ data, filter, onFilterChange, onViewInvoice }) {
  if (!data) return null;

  const { summary, grandTotal, invoices } = data;
  const filtered = filter === 'all' ? invoices : invoices.filter((inv) => inv.status === filter);
  const filteredSubtotal = filtered.reduce((s, i) => s + (i.subtotal || 0), 0);
  const filteredTotal = filtered.reduce((s, i) => s + (i.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summary.map((s) => (
          <button
            key={s.status}
            type="button"
            onClick={() => onFilterChange(s.status)}
            className={`text-left bg-white rounded-xl border border-gray-200 p-3 sm:p-5 border-l-4 ${cardAccent[s.status]} hover:shadow-md transition-shadow ${filter === s.status ? 'ring-2 ring-blue-500' : ''}`}
          >
            <p className="text-xs sm:text-sm text-gray-500">{statusLabels[s.status]}</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{s.count}</p>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mt-2 break-all">{formatCurrency(s.total)}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Invoice</p>
            <p className="text-lg sm:text-xl font-bold">{grandTotal.count}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Subtotal</p>
            <p className="text-sm sm:text-xl font-bold break-all">{formatCurrency(grandTotal.subtotal)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Pajak</p>
            <p className="text-sm sm:text-xl font-bold break-all">{formatCurrency(grandTotal.tax)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Grand Total</p>
            <p className="text-sm sm:text-xl font-bold text-blue-600 break-all">{formatCurrency(grandTotal.total)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Semua ({grandTotal.count})
          </button>
          {summary.map((s) => (
            <button
              key={s.status}
              type="button"
              onClick={() => onFilterChange(s.status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${filter === s.status ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {statusLabels[s.status]} ({s.count})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            Tidak ada invoice untuk status ini.
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {filtered.map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => onViewInvoice(inv.id)}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <span className="font-medium text-blue-600 break-all">{inv.invoice_number}</span>
                    <span className={`shrink-0 inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${badgeStyles[inv.status] || badgeStyles.draft}`}>
                      {statusLabels[inv.status] || inv.status}
                    </span>
                  </div>
                  <p className="text-gray-900">{inv.client_name}</p>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>{formatDate(inv.date)}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(inv.total || 0)}</span>
                  </div>
                </button>
              ))}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(filteredSubtotal)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total ({filtered.length})</span>
                  <span className="text-blue-600">{formatCurrency(filteredTotal)}</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Klien</th>
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">Jatuh Tempo</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Subtotal</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => (
                      <tr key={inv.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => onViewInvoice(inv.id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {inv.invoice_number}
                          </button>
                        </td>
                        <td className="px-6 py-4">{inv.client_name}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(inv.date)}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(inv.due_date)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase ${badgeStyles[inv.status] || badgeStyles.draft}`}>
                            {statusLabels[inv.status] || inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(inv.subtotal || 0)}</td>
                        <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.total || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                      <td colSpan={5} className="px-6 py-4 text-right text-gray-600">
                        Total {filter === 'all' ? 'Semua' : statusLabels[filter]} ({filtered.length})
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(filteredSubtotal)}</td>
                      <td className="px-6 py-4 text-right text-blue-600">{formatCurrency(filteredTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
