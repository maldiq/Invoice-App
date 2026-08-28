/**
 * Seed user demo + data dummy.
 * Run: node seed.js
 */
const bcrypt = require('bcryptjs');
const db = require('./database');

const DEMO_EMAIL = 'demo@nizam.id';
const DEMO_PASSWORD = 'demo123';

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0];

const seed = db.transaction(() => {
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(DEMO_EMAIL);

  if (!user) {
    const result = db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .run('Demo User', DEMO_EMAIL, bcrypt.hashSync(DEMO_PASSWORD, 10));
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    console.log(`✓ User dibuat: ${DEMO_EMAIL}`);
  } else {
    console.log(`✓ User sudah ada: ${DEMO_EMAIL}`);
  }

  // Hapus data lama milik demo agar seed bisa diulang bersih
  const oldInvoices = db.prepare('SELECT id FROM invoices WHERE user_id = ?').all(user.id);
  for (const inv of oldInvoices) {
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(inv.id);
  }
  db.prepare('DELETE FROM invoices WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM clients WHERE user_id = ?').run(user.id);

  const clients = [
    {
      name: 'PT Maju Jaya',
      email: 'finance@majujaya.co.id',
      address: 'Jl. Sudirman No. 12\nJakarta Selatan',
    },
    {
      name: 'CV Digital Kreatif',
      email: 'hello@digitalkreatif.id',
      address: 'Jl. Merdeka No. 45\nSurabaya',
    },
    {
      name: 'Toko Komputer Sejahtera',
      email: 'order@tokosejahtera.com',
      address: 'Jl. Ahmad Yani 88\nMalang',
    },
    {
      name: 'Yayasan Pendidikan Nusantara',
      email: 'admin@ypn.or.id',
      address: 'Jl. Pendidikan No. 3\nYogyakarta',
    },
  ];

  const insertClient = db.prepare(
    'INSERT INTO clients (user_id, name, email, address) VALUES (?, ?, ?, ?)'
  );
  const clientRows = clients.map((c) => {
    const r = insertClient.run(user.id, c.name, c.email, c.address);
    return { id: r.lastInsertRowid, ...c };
  });
  console.log(`✓ ${clientRows.length} klien dummy`);

  const stamp = Date.now().toString().slice(-8);
  const invoices = [
    {
      number: `INV-DEMO-${stamp}-0001`,
      date: today,
      due_date: addDays(today, 7),
      client: clientRows[0],
      status: 'draft',
      tax_rate: 0,
      notes: 'Draft — belum dikirim ke klien.',
      items: [
        { description: 'Jasa Installasi Windows & Office', quantity: 1, unit_price: 250000 },
        { description: 'Kabel LAN Cat6 (30m)', quantity: 1, unit_price: 150000 },
      ],
    },
    {
      number: `INV-DEMO-${stamp}-0002`,
      date: addDays(today, -3),
      due_date: addDays(today, 4),
      client: clientRows[1],
      status: 'sent',
      tax_rate: 0,
      notes: 'Mohon transfer sesuai rekening di invoice.',
      items: [
        { description: 'Domain .com (1 tahun)', quantity: 1, unit_price: 200000 },
        { description: 'Hosting SSD 5GB (1 tahun)', quantity: 1, unit_price: 450000 },
        { description: 'Setup Email Bisnis', quantity: 3, unit_price: 75000 },
      ],
    },
    {
      number: `INV-DEMO-${stamp}-0003`,
      date: addDays(today, -20),
      due_date: addDays(today, -13),
      client: clientRows[2],
      status: 'paid',
      tax_rate: 0,
      notes: 'Pembayaran diterima. Terima kasih.',
      items: [
        { description: 'Service Laptop (ganti thermal paste)', quantity: 2, unit_price: 150000 },
        { description: 'SSD 512GB NVMe', quantity: 1, unit_price: 750000 },
      ],
    },
    {
      number: `INV-DEMO-${stamp}-0004`,
      date: addDays(today, -15),
      due_date: addDays(today, -8),
      client: clientRows[3],
      status: 'overdue',
      tax_rate: 0,
      notes: 'Jatuh tempo — mohon segera dilunasi.',
      items: [
        { description: 'Maintenance Lab Komputer (bulanan)', quantity: 1, unit_price: 1500000 },
        { description: 'Antivirus License (10 device)', quantity: 1, unit_price: 800000 },
      ],
    },
    {
      number: `INV-DEMO-${stamp}-0005`,
      date: addDays(today, -5),
      due_date: addDays(today, 2),
      client: clientRows[0],
      status: 'sent',
      tax_rate: 11,
      notes: 'Termasuk PPN 11%.',
      items: [
        { description: 'Rakitan PC Office', quantity: 1, unit_price: 5500000 },
        { description: 'Monitor 24 inch', quantity: 1, unit_price: 1800000 },
        { description: 'Jasa Rakit & Setup', quantity: 1, unit_price: 200000 },
      ],
    },
  ];

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      user_id, invoice_number, date, due_date,
      client_name, client_email, client_address,
      status, tax_rate, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
    VALUES (?, ?, ?, ?)
  `);

  for (const inv of invoices) {
    const result = insertInvoice.run(
      user.id,
      inv.number,
      inv.date,
      inv.due_date,
      inv.client.name,
      inv.client.email,
      inv.client.address,
      inv.status,
      inv.tax_rate,
      inv.notes
    );
    for (const item of inv.items) {
      insertItem.run(result.lastInsertRowid, item.description, item.quantity, item.unit_price);
    }
  }
  console.log(`✓ ${invoices.length} invoice dummy`);
});

try {
  seed();
  console.log('\nLogin demo:');
  console.log(`  Email    : ${DEMO_EMAIL}`);
  console.log(`  Password : ${DEMO_PASSWORD}`);
} catch (err) {
  console.error('Seed gagal:', err.message);
  process.exit(1);
}
