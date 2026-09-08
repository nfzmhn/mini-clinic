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
- dokter / dokter123 (DOCTOR)
- petugas / petugas123 (REGISTRATION_OFFICER)
