const bcrypt = require('bcryptjs');
const db = require('../database');
const { signToken } = require('../middleware/auth');

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function claimOrphanData(userId) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount !== 1) return;

  db.prepare('UPDATE invoices SET user_id = ? WHERE user_id IS NULL').run(userId);
  db.prepare('UPDATE clients SET user_id = ? WHERE user_id IS NULL').run(userId);
}

exports.register = (req, res) => {
  if (process.env.REGISTER_ENABLED === 'false') {
    return res.status(403).json({ error: 'Pendaftaran ditutup. Hubungi admin.' });
  }

  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name.trim(), normalizedEmail, hash);

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(result.lastInsertRowid);
  claimOrphanData(user.id);

  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
};

exports.me = (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });
  res.json({ user: publicUser(user) });
};

exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Password lama dan password baru wajib diisi' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'Password baru harus berbeda dari password lama' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: 'Password lama salah' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, user.id);

  res.json({ message: 'Password berhasil diubah' });
};
