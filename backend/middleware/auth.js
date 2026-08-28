const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'invoice-app-dev-secret-change-me';

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Login diperlukan' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Sesi tidak valid atau sudah habis. Silakan login ulang.' });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { authRequired, signToken, JWT_SECRET };
