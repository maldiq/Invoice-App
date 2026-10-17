const db = require('../database');
const { sendMail, isSmtpConfigured } = require('../utils/mailer');

function formatDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('');
}

function generateInvoiceNumber(userId) {
  const count = db
    .prepare('SELECT COUNT(*) as count FROM invoices WHERE user_id = ?')
    .get(userId).count;
  const seq = String(count + 1).padStart(4, '0');
  return `INV-${formatDateTime()}-${seq}`;
}

function getItems(invoiceId) {
  return db
    .prepare('SELECT * FROM invoice_items WHERE invoice_id = ?')
    .all(invoiceId);
}

function calcTotals(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function attachTotals(invoice) {
  const items = getItems(invoice.id);
  const totals = calcTotals(items, invoice.tax_rate);
  return { ...invoice, items, ...totals };
}

function findOwnedInvoice(id, userId) {
  return db
    .prepare('SELECT * FROM invoices WHERE id = ? AND user_id = ?')
    .get(id, userId);
}

exports.getAll = (req, res) => {
  const invoices = db
    .prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json(invoices.map(attachTotals));
};

exports.getOne = (req, res) => {
  const invoice = findOwnedInvoice(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
  res.json(attachTotals(invoice));
};

exports.create = (req, res) => {
  const {
    date,
    due_date,
    client_name,
    client_email,
    client_address,
    status = 'draft',
    tax_rate = 0,
    notes = '',
    items = [],
  } = req.body;

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (user_id, invoice_number, date, due_date, client_name, client_email, client_address, status, tax_rate, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);

  const create = db.transaction(() => {
    const number = generateInvoiceNumber(req.user.id);
    const result = insertInvoice.run(
      req.user.id, number, date, due_date, client_name,
      client_email, client_address, status, tax_rate, notes
    );
    const invoiceId = result.lastInsertRowid;
    for (const item of items) {
      insertItem.run(invoiceId, item.description, item.quantity, item.unit_price);
    }
    return invoiceId;
  });

  const invoiceId = create();
  const invoice = findOwnedInvoice(invoiceId, req.user.id);
  res.status(201).json(attachTotals(invoice));
};

exports.update = (req, res) => {
  const existing = findOwnedInvoice(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  const {
    invoice_number,
    date,
    due_date,
    client_name,
    client_email,
    client_address,
    status,
    tax_rate,
    notes,
    items = [],
  } = req.body;

  const updateInvoice = db.prepare(`
    UPDATE invoices SET
      invoice_number = ?, date = ?, due_date = ?,
      client_name = ?, client_email = ?, client_address = ?,
      status = ?, tax_rate = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `);

  const deleteItems = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?');
  const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);

  const update = db.transaction(() => {
    updateInvoice.run(
      invoice_number || existing.invoice_number,
      date, due_date, client_name,
      client_email, client_address, status, tax_rate, notes,
      req.params.id, req.user.id
    );
    deleteItems.run(req.params.id);
    for (const item of items) {
      insertItem.run(req.params.id, item.description, item.quantity, item.unit_price);
    }
  });

  update();
  const invoice = findOwnedInvoice(req.params.id, req.user.id);
  res.json(attachTotals(invoice));
};

exports.remove = (req, res) => {
  const existing = findOwnedInvoice(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Invoice not found' });

  db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(req.params.id);
  db.prepare('DELETE FROM invoices WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Invoice deleted' });
};

exports.getNextNumber = (req, res) => {
  res.json({ invoice_number: generateInvoiceNumber(req.user.id) });
};

exports.getReportByStatus = (req, res) => {
  const invoices = db
    .prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map(attachTotals);
  const statuses = ['draft', 'sent', 'paid', 'overdue'];

  const summary = statuses.map((status) => {
    const filtered = invoices.filter((inv) => inv.status === status);
    return {
      status,
      count: filtered.length,
      subtotal: filtered.reduce((s, i) => s + (i.subtotal || 0), 0),
      tax: filtered.reduce((s, i) => s + (i.tax || 0), 0),
      total: filtered.reduce((s, i) => s + (i.total || 0), 0),
    };
  });

  const grandTotal = {
    count: invoices.length,
    subtotal: invoices.reduce((s, i) => s + (i.subtotal || 0), 0),
    tax: invoices.reduce((s, i) => s + (i.tax || 0), 0),
    total: invoices.reduce((s, i) => s + (i.total || 0), 0),
  };

  res.json({ summary, grandTotal, invoices });
};

exports.getDashboard = (req, res) => {
  const invoices = db
    .prepare('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map(attachTotals);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const byStatus = (status) => invoices.filter((i) => i.status === status);
  const sum = (list) => list.reduce((s, i) => s + (i.total || 0), 0);

  const paid = byStatus('paid');
  const paidThisMonth = paid.filter((i) => (i.date || '').startsWith(ym));
  const outstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');

  res.json({
    counts: {
      all: invoices.length,
      draft: byStatus('draft').length,
      sent: byStatus('sent').length,
      paid: paid.length,
      overdue: byStatus('overdue').length,
    },
    totals: {
      outstanding: sum(outstanding),
      overdue: sum(byStatus('overdue')),
      paidThisMonth: sum(paidThisMonth),
      paidAll: sum(paid),
    },
    recent: invoices.slice(0, 5),
    smtpConfigured: isSmtpConfigured(),
  });
};

exports.sendEmail = async (req, res) => {
  try {
    const invoice = findOwnedInvoice(req.params.id, req.user.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const to = (req.body.to || invoice.client_email || '').trim();
    if (!to) return res.status(400).json({ error: 'Email penerima wajib diisi' });

    const subject = req.body.subject || `Invoice ${invoice.invoice_number}`;
    const message = req.body.message
      || `Halo ${invoice.client_name},\n\nTerlampir invoice ${invoice.invoice_number}. Terima kasih.\n`;

    const attachments = [];
    if (req.body.pdfBase64) {
      const raw = String(req.body.pdfBase64).replace(/^data:application\/pdf;base64,/, '');
      attachments.push({
        filename: `${invoice.invoice_number}.pdf`,
        content: Buffer.from(raw, 'base64'),
        contentType: 'application/pdf',
      });
    }

    await sendMail({
      to,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
      attachments,
    });

    if (invoice.status === 'draft') {
      db.prepare('UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?')
        .run('sent', invoice.id, req.user.id);
    }

    const updated = attachTotals(findOwnedInvoice(req.params.id, req.user.id));
    res.json({ message: 'Invoice terkirim', invoice: updated });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Gagal mengirim email' });
  }
};
