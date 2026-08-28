const db = require('../database');

function findOwnedClient(id, userId) {
  return db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(id, userId);
}

exports.getAll = (req, res) => {
  const clients = db
    .prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY name ASC')
    .all(req.user.id);
  res.json(clients);
};

exports.getOne = (req, res) => {
  const client = findOwnedClient(req.params.id, req.user.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
};

exports.create = (req, res) => {
  const { name, email = '', address = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Client name is required' });

  const result = db
    .prepare('INSERT INTO clients (user_id, name, email, address) VALUES (?, ?, ?, ?)')
    .run(req.user.id, name.trim(), email.trim(), address.trim());

  const client = findOwnedClient(result.lastInsertRowid, req.user.id);
  res.status(201).json(client);
};

exports.update = (req, res) => {
  const existing = findOwnedClient(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  const { name, email = '', address = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Client name is required' });

  db.prepare('UPDATE clients SET name = ?, email = ?, address = ? WHERE id = ? AND user_id = ?')
    .run(name.trim(), email.trim(), address.trim(), req.params.id, req.user.id);

  const client = findOwnedClient(req.params.id, req.user.id);
  res.json(client);
};

exports.remove = (req, res) => {
  const existing = findOwnedClient(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Client not found' });

  db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Client deleted' });
};
