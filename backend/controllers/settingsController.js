const fs = require('fs');
const path = require('path');
const db = require('../database');

const UPLOAD_DIR = path.join(__dirname, '../uploads/logos');

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getSettings(userId) {
  let row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  if (!row) {
    db.prepare('INSERT INTO user_settings (user_id) VALUES (?)').run(userId);
    row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  }
  return row;
}

function toPublic(row) {
  return {
    logo_url: row.logo_path ? `/uploads/${row.logo_path}` : null,
  };
}

exports.get = (req, res) => {
  res.json(toPublic(getSettings(req.user.id)));
};

exports.uploadLogo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File logo wajib (PNG, JPG, atau WEBP, max 2MB)' });
  }

  ensureUploadDir();
  const existing = getSettings(req.user.id);
  if (existing.logo_path) {
    const oldPath = path.join(__dirname, '../uploads', existing.logo_path);
    fs.unlink(oldPath, () => {});
  }

  const relative = `logos/${req.file.filename}`;
  db.prepare(`
    INSERT INTO user_settings (user_id, logo_path, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET logo_path = excluded.logo_path, updated_at = datetime('now')
  `).run(req.user.id, relative);

  const row = getSettings(req.user.id);
  res.json(toPublic(row));
};

exports.removeLogo = (req, res) => {
  const existing = getSettings(req.user.id);
  if (existing.logo_path) {
    const oldPath = path.join(__dirname, '../uploads', existing.logo_path);
    fs.unlink(oldPath, () => {});
  }
  db.prepare("UPDATE user_settings SET logo_path = NULL, updated_at = datetime('now') WHERE user_id = ?")
    .run(req.user.id);
  res.json({ logo_url: null });
};
