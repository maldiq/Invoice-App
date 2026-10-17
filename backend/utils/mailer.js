const nodemailer = require('nodemailer');

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, text, html, attachments = [] }) {
  const transporter = getTransporter();
  if (!transporter) {
    const err = new Error('SMTP belum dikonfigurasi. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS di backend/.env');
    err.status = 503;
    throw err;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  return transporter.sendMail({ from, to, subject, text, html, attachments });
}

module.exports = { isSmtpConfigured, sendMail };
