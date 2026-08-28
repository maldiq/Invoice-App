# Invoice App

Aplikasi invoice sederhana dengan Node.js + Express + SQLite di backend, dan React + Vite + Tailwind di frontend. PDF di-generate langsung di browser menggunakan `@react-pdf/renderer`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, better-sqlite3 |
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| PDF | @react-pdf/renderer (client-side) |

## Fitur

- Login & daftar akun (JWT)
- Data invoice & klien terpisah per user
- CRUD invoice (create, read, update, delete)
- Auto-generate nomor invoice (`INV-YYYYMMDD-urut`)
- Multiple line items per invoice
- Kalkulasi subtotal, tax, dan total otomatis
- Preview invoice di browser
- Download invoice sebagai PDF
- Status: draft, sent, paid, overdue
- Laporan berdasarkan status
- Manajemen klien

## Struktur Project

```
invoice_app/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database.js
│   ├── routes/invoiceRoutes.js
│   ├── controllers/invoiceController.js
│   └── .env
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── InvoiceForm.jsx
│   │   │   ├── InvoicePreview.jsx
│   │   │   └── InvoicePDF.jsx
│   │   └── api/invoiceApi.js
│   └── tailwind.config.js
└── README.md
```

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:3001`. Database SQLite (`invoices.db`) dibuat otomatis saat pertama kali dijalankan.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`. Request API di-proxy ke backend via Vite config.

## Deploy (cPanel & VPS)

Panduan lengkap upload ke **cPanel Node.js App** dan **VPS (Nginx + PM2)** ada di [DEPLOY.md](DEPLOY.md).

Ringkasnya:

1. Build frontend: `cd frontend && npm run build`
2. Install backend **di server Linux**: `cd backend && npm install --omit=dev`
3. Jalankan `node server.js` (cPanel Application Manager atau PM2)

Di produksi, backend menyajikan `frontend/dist` sekaligus API `/api`.

## API Endpoints

Auth (publik):

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Daftar akun |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Profil user (butuh token) |

Invoice & klien (wajib header `Authorization: Bearer <token>`):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoice milik user |
| GET | `/api/invoices/next-number` | Nomor invoice berikutnya |
| GET | `/api/invoices/report/by-status` | Laporan per status |
| GET | `/api/invoices/:id` | Detail invoice |
| POST | `/api/invoices` | Buat invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Hapus invoice |
| GET/POST/PUT/DELETE | `/api/clients` | CRUD klien milik user |

## Environment Variables

Backend (`.env`):

```
PORT=3001
NODE_ENV=production
JWT_SECRET=ganti-dengan-secret-acak-yang-panjang
JWT_EXPIRES_IN=7d
```

`CORS_ORIGIN` opsional jika frontend dan API tidak satu domain.
