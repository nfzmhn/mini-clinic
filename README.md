# Mini Clinic Information System - README

## Setup
1. Pastikan MySQL berjalan.
2. `cd backend && npm install`
3. Salin `.env.example` ke `.env` dan isi `DATABASE_URL` (contoh: `mysql://root:password@localhost:3306/mini_clinic`).
4. `npm run migrate`
5. `npm run seed`
6. `npm run dev`

## Akun Default
- admin / admin123 (ADMIN)
- petugas / petugas123 (REGISTRATION_OFFICER)
- dr. Andi Wijaya / dokter123 / DOCTOR — Poli Umum (ID 7)
- drg. Sari Dewi / dokter456 / DOCTOR — Poli Gigi (ID 8)
- dr. Hendra Sp.A / dokter789 / DOCTOR — Poli Anak (ID 9)

