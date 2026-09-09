# Mini Clinic Information System

Sistem informasi manajemen klinik mini berbasis **Framework Express.js (backend)** + **React + Vite (frontend)** dengan database **MySQL + Prisma ORM**. Mendukung autentikasi JWT, manajemen pasien, pendaftaran kunjungan, antrian, rekam medis SOAP, resep obat, master poli, dan dashboard statistik.

**Stack:**
- Backend: Node.js, Express, Prisma, MySQL, JWT
- Frontend: React, Vite, TailwindCSS
- Auth: Bearer Token (JWT), 3 role (ADMIN, DOCTOR, REGISTRATION_OFFICER)



## 1. Cara Instalasi Aplikasi

### Prasyarat
- **Node.js** 
- **MySQL** 
- **Git**

### Langkah-langkah

```bash
# 1. Clone repository
git clone <repo-url>
cd mini-clinic

# 2. Install dependencies Backend
cd backend
npm install

# 3. Siapkan file environment
cp .env.example .env
# Edit .env isi DATABASE_URL, JWT_SECRET, dll sesuai lingkungan Anda

# 4. Install dependencies Frontend
cd ../frontend
npm install
```

---

## 2. Cara Menjalankan Aplikasi

### Development Mode (2 terminal terpisah)

**Terminal 1 — Backend (port 5000):**
```bash
cd mini-clinic/backend
npm run dev
# Server berjalan di http://localhost:5000
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd mini-clinic/frontend
npm run dev
# Aplikasi berjalan di http://localhost:5173
```

> Frontend sudah dikonfigurasi proxy `/api` ke `http://localhost:5000` via Vite.

### Production Build
```bash
# Frontend build
cd mini-clinic/frontend
npm run build
# Output di folder dist/, siap di-deploy ke static hosting / Nginx

# Backend production
cd mini-clinic/backend
npm start
# Node langsung jalan tanpa nodemon
```

---

## 3. Struktur Project

```
mini-clinic/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Skema database (User, Poli, Patient, Registration, MedicalRecord, dll)
│   │   ├── seed.js              # Data seeding (akun, poli, pasien dummy, rekam medis)
│   │   └── migrations/          # History migrasi Prisma
│   ├── src/
│   │   ├── index.js             # Entry point Express + middleware global
│   │   ├── routes/              # Route definitions (auth, patients, registrations, queues, medical-records, prescriptions, polis, users, dashboard)
│   │   ├── controllers/         # Logika per modul
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT
│   │   └── utils/               # Helper (response formatter, prisma client)
│   ├── .env.example             # Template environment
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # Entry React + providers (QueryClient, Router)
│   │   ├── App.jsx              # Routing + layout
│   │   ├── pages/               # Halaman per fitur (Login, Dashboard, Patients, Registrations, Queues, MedicalRecords, Prescriptions)
│   │   ├── components/          # UI reusable (Table, Modal, Form, Input, Button, Badge, Layout, Sidebar, Header)
│   │   ├── hooks/               # Custom hooks (useAuth, useApi, useDebounce)
│   │   ├── services/            # Axios instance + API calls
│   │   ├── utils/               # Formatters, validators, constants
│   │   └── styles/              # Tailwind entry (index.css)
│   ├── index.html
│   ├── vite.config.js           # Proxy /api -> localhost:5000
│   ├── tailwind.config.js
│   ├── package.json
│   └── package-lock.json
├── docs/
│   ├── postman.json             # Collection Postman lengkap 9 grup endpoint
│   ├── erd-diagram.png          # ERD database
│   └── dump.sql                 # Dump database (opsional)
└── README.md                    # File ini
```

---

## 4. ERD (Entity Relationship Diagram)

![ERD Mini Clinic](docs/erd-diagram.png)

> File ERD lokal: `docs/erd-diagram.png` — 8 tabel: users, polis, patients, registrations, medical_records, medical_actions, prescriptions, prescription_items. Relasi utama: Patient 1—N Registration, Registration 1—1 MedicalRecord, MedicalRecord 1—N MedicalAction, MedicalRecord 1—1 Prescription, Prescription 1—N PrescriptionItem, Poli 1—N User (Doctor) & Registration.

---

## 5. Akun Login (Default dari Seeder)

Jalankan `npm run seed` di backend untuk membuat akun berikut:

| Username | Password | Role | Keterangan |
|----------|----------|------|------------|
| `admin` | `admin123` | `ADMIN` | Akses penuh sistem |
| `petugas` | `petugas123` | `REGISTRATION_OFFICER` | Pendaftaran & antrian |
| `dr. Andi Wijaya` | `dokter123` | `DOCTOR` | Poli Umum (ID 7) |
| `drg. Sari Dewi` | `dokter456` | `DOCTOR` | Poli Gigi & Mulut (ID 8) |
| `dr. Hendra Sp.A` | `dokter789` | `DOCTOR` | Poli Anak (ID 9) |

> Login di `POST /api/auth/login` dengan body `{ "username": "...", "password": "..." }` → dapat JWT token.

---

## 6. Konfigurasi File `.env`

Salin template lalu isi sesuai lingkungan:

```bash
cd backend
cp .env.example .env
```

### Variabel Wajib (Backend)

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Koneksi MySQL (user:pass@host:port/db) | `mysql://root:password@localhost:3306/mini_clinic` |
| `JWT_SECRET` | Secret key signing JWT (min 32 char random) | `your_jwt_secret_key_here` |
| `PORT` | Port server Express | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### Variabel Frontend (Vite)

| Variabel | Deskripsi | Contoh |
|----------|-----------|--------|
| `VITE_API_URL` | Base URL API backend | `http://localhost:5000/api` |

> **Penting:** Jangan commit file `.env` asli. Gunakan `.env.example` sebagai referensi tim.

---

## 7. Migrasi Database (Prisma)

Semua perintah dijalankan dari folder `backend/`:

```bash
cd backend

# 1. Buat & jalankan migrasi baru (development)
npm run migrate

# 2. Seed data awal (akun, poli, pasien dummy, rekam medis)
npm run seed

# 3. Buka Prisma Studio (GUI database)
npm run studio

# 4. Reset database total (hapus data + migrasi ulang + seed)
npx prisma migrate reset --force
npm run seed
```

> `prisma migrate dev` otomatis generate migrasi dari perubahan `schema.prisma` dan apply ke database.

---

## 8. Dokumentasi API (Postman Collection)

File collection: **`docs/postman.json`**

### Cara Import ke Postman
1. Buka Postman → **Import** → pilih file `docs/postman.json`
2. Collection "Mini Clinic REST API" akan muncul di sidebar
3. Atau drag-drop file ke workspace Postman

### Variabel Collection
| Variabel | Deskripsi | Nilai Default |
|----------|-----------|---------------|
| `base_url` | Base URL API | `http://localhost:5000/api` |
| `token` | JWT token (auto-set setelah login) | *(kosong)* |

> **Auto-token:** Request `POST /auth/login` memiliki test script yang otomatis menyimpan `token` ke collection variable. Cukup jalankan login sekali, token akan terpakai di request lain yang butuh auth.

### Grup Endpoint (9 grup)

| Grup | Deskripsi | Contoh Endpoint |
|------|-----------|-----------------|
| **Authentication** | Login, logout, me | `POST /auth/login`, `GET /auth/me` |
| **Patient** | CRUD pasien + MRN otomatis | `GET/POST/PUT/DELETE /patients` |
| **Registration** | Pendaftaran kunjungan + nomor antrian | `GET/POST/PUT /registrations`, `PUT /registrations/:id/status` |
| **Queue** | Manajemen antrian (panggil, update status) | `GET/POST /queues`, `PUT /queues/:id/call` |
| **Medical Record** | Rekam medis SOAP (create, read by patient/registration) | `POST /medical-records`, `GET /medical-records/:patientId` |
| **Prescription** | Resep obat terikat ke rekam medis | `POST /prescriptions`, `GET /prescriptions/:id` |
| **Poli (Poliklinik)** | Master data poli (ADMIN only) | `GET/POST/PUT/DELETE /polis` |
| **Users (Admin Only)** | Manajemen user sistem (ADMIN only) | `GET/POST/PUT/DELETE /users` |
| **Dashboard** | Statistik ringkasan | `GET /dashboard` |

### Autentikasi
Semua endpoint (kecuali `POST /auth/login`) butuh header:
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 9. Referensi Cepat Perintah

```bash
# Backend
cd backend
npm run dev
npm run start      
npm run migrate    
npm run seed      
npm run studio     

# Frontend
cd frontend
npm run dev       
npm run build      
npm run preview    
npm run lint      
```

---

**Lisensi:** Internal — PT Inova Medika