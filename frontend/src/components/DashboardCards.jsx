function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function DashboardCards({ data, onViewInvoice }) {
  if (!data) return null;

  const cards = [
    { label: 'Piutang', value: formatCurrency(data.totals.outstanding), hint: 'Sent + overdue', accent: 'border-l-amber-500' },
    { label: 'Jatuh tempo', value: formatCurrency(data.totals.overdue), hint: `${data.counts.overdue} invoice`, accent: 'border-l-red-500' },
    { label: 'Lunas bulan ini', value: formatCurrency(data.totals.paidThisMonth), hint: `${data.counts.paid} lunas total`, accent: 'border-l-green-500' },
    { label: 'Draft', value: String(data.counts.draft), hint: `${data.counts.all} invoice`, accent: 'border-l-gray-400' },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${c.accent} p-4`}>
            <p className="text-xs sm:text-sm text-gray-500">{c.label}</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 break-all">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.hint}</p>
          </div>
        ))}
      </div>

      {data.recent?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoice terbaru</h3>
          <ul className="space-y-2">
            {data.recent.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 text-sm">
                <button type="button" onClick={() => onViewInvoice(inv.id)} className="text-blue-600 hover:underline text-left truncate">
                  {inv.invoice_number}
                </button>
                <span className="hidden sm:inline text-gray-600 truncate">{inv.client_name}</span>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${statusStyles[inv.status] || statusStyles.draft}`}>
                  {inv.status}
                </span>
                <span className="shrink-0 font-medium">{formatCurrency(inv.total || 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
