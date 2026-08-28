const db = require('../database');

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
