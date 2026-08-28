# Deploy Invoice App (cPanel & VPS)

Aplikasi ini terdiri dari **frontend React** (hasil build ke folder `frontend/dist`) dan **backend Node.js + SQLite**. Di produksi, backend juga menyajikan file frontend, jadi cukup **satu proses Node**.

```
Pengunjung  →  Node (server.js)
                 ├── /api/...   API invoice & klien
                 └── /*         halaman React (frontend/dist)
```

**Penting:** `better-sqlite3` adalah native module. `npm install` harus dijalankan **di server Linux**, jangan copy `node_modules` dari Windows.

---

## Persiapan di komputer lokal

1. Pastikan Node.js 18+ terpasang.
2. Build frontend:

```bash
cd frontend
npm install
npm run build
```

Folder `frontend/dist` harus ada sebelum upload.

3. Siapkan file `backend/.env` (jangan commit ke git):

```
PORT=3001
NODE_ENV=production
JWT_SECRET=ganti-dengan-secret-acak-yang-panjang
JWT_EXPIRES_IN=7d
```

`JWT_SECRET` wajib diganti di production. `CORS_ORIGIN` opsional jika frontend dan API tidak satu domain.

---

## A. Upload ke cPanel (Node.js App)

Cocok jika hosting punya menu **Setup Node.js App** / **Application Manager** dan akses SSH.

### Syarat hosting

- Node.js 18 atau 20
- Akses SSH (disarankan)
- Compiler untuk native module (`gcc`, `make`, Python) — banyak shared hosting **tidak** punya ini. Jika `better-sqlite3` gagal compile, pakai **VPS**.

### Struktur folder di server

Upload seluruh project (kecuali `node_modules`) ke home, misalnya:

```
/home/USER/invoice_app/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── ...
└── frontend/
    └── dist/          ← hasil `npm run build`
```

Jangan upload:

- `frontend/node_modules`
- `backend/node_modules` (install di server)
- `frontend/src` boleh tidak diupload kalau `dist` sudah ada (opsional)

### Langkah di cPanel

1. **File Manager / FTP**  
   Upload project ke `invoice_app/` seperti struktur di atas.

2. **Setup Node.js App**
   - **Node.js version:** 18 atau 20
   - **Application mode:** Production
   - **Application root:** `invoice_app/backend`  
     (folder tempat `server.js` dan `package.json`)
   - **Application URL:** domain atau subdomain, contoh `invoice.nizamkomputer.com`
   - **Application startup file:** `server.js`

3. **Environment variables** (di form Node.js App):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |

   `PORT` biasanya sudah di-set cPanel. Jangan override kecuali dokumentasi hosting meminta.

4. **SSH** — install dependency di server:

```bash
cd ~/invoice_app/backend
npm install --omit=dev
```

Jika error saat compile `better-sqlite3`:

```bash
npm rebuild better-sqlite3
```

Kalau tetap gagal, hosting tidak mendukung native addon → pindah ke VPS.

5. Kembali ke **Setup Node.js App** → **Restart**.

6. Buka Application URL. Cek API:

```
https://invoice.domainanda.com/api/health
```

Harus mengembalikan `{"status":"ok"}`.

### Catatan cPanel

- Database SQLite ada di `backend/invoices.db`. Pastikan folder backend **writable**.
- Backup `invoices.db` secara berkala (download via File Manager).
- Setelah ubah frontend: build ulang di lokal, upload ulang folder `frontend/dist`, lalu restart app.
- Subdomain lebih rapi daripada meletakkan Node di dalam `public_html` PHP.

### Jika cPanel tidak punya Node.js App

Shared hosting PHP murni **tidak bisa** menjalankan backend ini. Opsi:

- Upgrade ke hosting Node.js / CloudLinux Application Manager
- Atau deploy di VPS (bagian B)

---

## B. Upload ke VPS (Ubuntu + Nginx + PM2)

Cocok untuk production yang stabil.

### 1. Persiapan server

SSH ke VPS:

```bash
sudo apt update
sudo apt install -y nginx git build-essential python3
```

Install Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 2. Upload kode

**Opsi A — Git**

```bash
cd /var/www
sudo git clone <URL_REPO> invoice_app
sudo chown -R $USER:$USER /var/www/invoice_app
```

**Opsi B — SCP dari Windows (PowerShell)**

```powershell
scp -r D:\laragon\www\workdir\invoice_app user@IP_VPS:/var/www/invoice_app
```

Jangan kirim `node_modules`.

### 3. Install & build di VPS

```bash
cd /var/www/invoice_app/frontend
npm install
npm run build

cd /var/www/invoice_app/backend
npm install --omit=dev
```

Buat `.env`:

```bash
nano /var/www/invoice_app/backend/.env
```

Isi:

```
PORT=3001
NODE_ENV=production
JWT_SECRET=ganti-dengan-secret-acak-yang-panjang
JWT_EXPIRES_IN=7d
```

```bash
cd /var/www/invoice_app/backend
pm2 start server.js --name invoice-app
pm2 save
pm2 startup
```

Cek:

```bash
curl http://127.0.0.1:3001/api/health
```

### 5. Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/invoice
```

Isi (ganti domain):

```nginx
server {
    listen 80;
    server_name invoice.domainanda.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/invoice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Arahkan DNS A record subdomain ke IP VPS.

### 6. HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d invoice.domainanda.com
```

### Update aplikasi di VPS

```bash
cd /var/www/invoice_app
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install --omit=dev
pm2 restart invoice-app
```

---

## Checklist setelah deploy

- [ ] `https://domain/api/health` → `{"status":"ok"}`
- [ ] Halaman utama terbuka (bukan JSON error)
- [ ] Buat klien & invoice berhasil
- [ ] Download PDF berjalan
- [ ] File `backend/invoices.db` terbuat dan bisa di-backup
- [ ] Folder backend bisa ditulis user Node (permission)

## Troubleshooting

| Masalah | Penyebab umum | Solusi |
|---------|----------------|--------|
| Halaman putih / 404 | `frontend/dist` belum diupload / belum di-build | `npm run build` lalu upload `dist` |
| `better-sqlite3` error | Compile gagal / node_modules dari Windows | `npm install` ulang di Linux |
| API 404 | App root salah atau startup file bukan `server.js` | Cek path cPanel / PM2 |
| Port already in use | Port 3001 dipakai proses lain | Ganti `PORT` atau hentikan proses lama |
| Data hilang setelah restart | DB di path salah / folder dihapus | Backup `invoices.db`, jangan hapus folder backend |
| CORS error | Frontend dan API beda domain | Deploy satu origin (cara di dokumen ini) atau set `CORS_ORIGIN` |

## Backup database

Salin file SQLite:

```
backend/invoices.db
```

Jadwalkan copy harian (cron di VPS atau download berkala dari cPanel File Manager).
