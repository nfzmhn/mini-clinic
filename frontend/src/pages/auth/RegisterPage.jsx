import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './RegisterPage.css'

const schema = z.object({
  name: z.string().min(3, 'Nama lengkap wajib diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK hanya angka'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'No. WhatsApp wajib diisi'),
  facility: z.string().min(1, 'Fasilitas wajib dipilih'),
  desk: z.string().optional(),
  password: z.string().min(8, 'Minimal 8 karakter').regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Harus kombinasi huruf & angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  agree: z.boolean().refine(v => v === true, 'Harus menyetujui ketentuan'),
}).refine(d => d.password === d.confirmPassword, { message: 'Konfirmasi kata sandi tidak cocok', path: ['confirmPassword'] })

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { facility: 'pusat', desk: 'loket1', agree: true },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registrasi gagal')
      navigate('/login', { replace: true })
    } catch (e) {
      setServerError(e.message || 'Registrasi gagal. Periksa data.')
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-left">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00b4d8]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00b4d8]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-8">
            <div className="inline-block bg-white p-2.5 rounded-xl shadow-md"><img src="/logo.png" alt="Medvita" className="h-10 w-auto" /></div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-3"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Portal Pendaftaran Resmi</div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-snug">Registrasi Akun Staf &amp; Petugas Layanan</h1>
              <p className="text-slate-300 text-sm mt-2.5 leading-relaxed">Daftarkan akun kerja resmi Anda untuk mengakses operasional loket pendaftaran, reservasi antrean pasien, dan administrasi rekam medis poliklinik.</p>
            </div>
            <div className="space-y-3.5 pt-2">
              {[
                ['Verifikasi NIK Kependudukan', 'Wajib mencantumkan 16 digit NIK aktif sesuai e-KTP untuk validasi identitas kepegawaian internal.'],
                ['Otorisasi Hak Akses Cepat', 'Akun petugas langsung terhubung ke modul Loket Pendaftaran & Antrean Poliklinik secara instan.'],
                ['Enkripsi Kredensial Medis', 'Standar pengamanan password bcrypt dengan audit keamanan data rekam medis terpadu.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8] flex-shrink-0"><span className="material-symbols-outlined text-sm">verified_user</span></div>
                  <div><h4 className="text-xs font-bold tracking-wide">{title}</h4><p className="text-[11px] text-slate-300 mt-0.5">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 pt-8 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400"><span>Kemenkes RI Reg. ID: 3273-SYS-2024</span><span className="inline-flex items-center gap-1.5 text-slate-300">Sistem Online v4.8</span></div>
        </div>

        <div className="register-right">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div><span className="text-[11px] font-bold tracking-wider uppercase text-[#00b4d8]">Registrasi Baru</span><h2 className="text-xl lg:text-2xl font-extrabold text-[#0d2b56]">Formulir Pendaftaran Akun</h2></div>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"><span className="material-symbols-outlined text-sm">arrow_back</span>Kembali ke Login</Link>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-start gap-3">
              <span className="material-symbols-outlined text-sm text-blue-600 mt-0.5">info</span>
              <p className="text-xs text-blue-900 leading-relaxed"><b>Pendaftaran Akun Khusus Petugas Pelayanan &amp; Rekam Medis.</b> Isi data sesuai identitas resmi untuk pengaktifan modul antrean dan loket pendaftaran.</p>
            </div>

            {serverError && <div className="mt-4 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-xs text-[#93000a]">{serverError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="register-label">Nama Lengkap Petugas <span>*</span></label>
                  <input {...register('name')} placeholder="cth. Anita Rahmawati, A.Md.RMIK" className="register-input" />
                  {errors.name && <p className="register-error">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="register-label">Nomor Induk Kependudukan (NIK) <span>*</span></label>
                  <input {...register('nik')} maxLength={16} placeholder="16 digit NIK sesuai KTP" className="register-input font-mono" />
                  {errors.nik && <p className="register-error">{errors.nik.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="register-label">Alamat Email Dinas / Pribadi <span>*</span></label>
                  <input {...register('email')} type="email" placeholder="petugas@medvita.id" className="register-input" />
                  {errors.email && <p className="register-error">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="register-label">No. WhatsApp / Kontak Petugas <span>*</span></label>
                  <input {...register('phone')} placeholder="0812-xxxx-xxxx" className="register-input" />
                  {errors.phone && <p className="register-error">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="register-label">Fasilitas / Unit Pelayanan Klinik <span>*</span></label>
                  <select {...register('facility')} className="register-select">
                    <option value="pusat">Klinik Utama Medvita - Pusat (Bandung Dago)</option>
                    <option value="cabang1">Klinik Medvita Pratama - Buah Batu</option>
                    <option value="cabang2">Klinik Medvita Pratama - Setiabudi</option>
                  </select>
                  {errors.facility && <p className="register-error">{errors.facility.message}</p>}
                </div>
                <div>
                  <label className="register-label">Penugasan Meja / Loket</label>
                  <select {...register('desk')} className="register-select">
                    <option value="loket1">Loket Pendaftaran 01 (Pasien Umum &amp; Baru)</option>
                    <option value="loket2">Loket Pendaftaran 02 (BPJS Kesehatan &amp; Asuransi)</option>
                    <option value="triage">Triage &amp; Administrasi Rekam Medis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="register-label">Kata Sandi Baru <span>*</span></label>
                  <div className="relative">
                    <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Minimal 8 karakter & kombinasi angka" className="register-input pr-10" />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-sm">{showPw ? 'visibility_off' : 'visibility'}</span></button>
                  </div>
                  {errors.password && <p className="register-error">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="register-label">Ulangi Kata Sandi <span>*</span></label>
                  <div className="relative">
                    <input {...register('confirmPassword')} type={showPw2 ? 'text' : 'password'} placeholder="Masukkan kembali kata sandi" className="register-input pr-10" />
                    <button type="button" onClick={() => setShowPw2(v => !v)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-sm">{showPw2 ? 'visibility_off' : 'visibility'}</span></button>
                  </div>
                  {errors.confirmPassword && <p className="register-error">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" {...register('agree')} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0d2b56] focus:ring-[#0d2b56]" />
                  <span className="text-[11px] text-slate-600 leading-normal">Saya menyatakan data yang diisi benar serta bersedia mematuhi pakta kerahasiaan rekam medis dan UU Perlindungan Data Pribadi (UU PDP).</span>
                </label>
                {errors.agree && <p className="register-error mt-1">{errors.agree.message}</p>}
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button type="submit" disabled={isSubmitting} className="register-btn-primary">
                  {isSubmitting ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Mendaftarkan...</> : <><span className="material-symbols-outlined text-sm">person_add</span>Daftarkan Akun Petugas</>}
                </button>
                <Link to="/login" className="w-full sm:w-auto py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl text-center">Sudah Punya Akun? Masuk</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
