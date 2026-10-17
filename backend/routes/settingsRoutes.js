const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const controller = require('../controllers/settingsController');
const { authRequired } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads/logos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(png|jpe?g|webp)$/i.test(file.mimetype);
    cb(ok ? null : new Error('Format logo harus PNG, JPG, atau WEBP'), ok);
  },
});

const router = express.Router();
router.use(authRequired);

router.get('/', controller.get);
router.post('/logo', (req, res, next) => {
  upload.single('logo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload gagal' });
    next();
  });
}, controller.uploadLogo);
router.delete('/logo', controller.removeLogo);

module.exports = router;
