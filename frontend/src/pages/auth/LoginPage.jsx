import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login, saveSession } from '../../services/auth'
import './LoginPage.css'

const schema = z.object({
  username: z.string().min(3, 'ID / Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  facility: z.string().optional(),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', facility: 'bdg-central' },
  })

  const onSubmit = async (values) => {
    setServerError('')
    try {
      const res = await login({ username: values.username, password: values.password })
      const token = res.data?.token || res.token
      const user = res.data?.user || res.user
      if (token) saveSession(token, user)
      const dest = user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor/queue' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.errors?.[0]?.message || 'Login gagal. Periksa kredensial.'
      setServerError(msg)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-6 bg-[#f8f9ff] bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(80,217,254,0.12),transparent_70%)]">
      <div className="w-full max-w-6xl mx-auto flex justify-center">
        <div className="flex flex-col w-full rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] border border-[#c4c6d0]/30 bg-white">
          <div className="lg:col-span-5 bg-[#0d2b56] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#50d9fe] opacity-10 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 bottom-0 w-80 h-80 rounded-full bg-[#455e8c] opacity-15 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <img alt="Medvita" className="h-11 w-auto bg-white p-1 rounded-lg shadow-sm" src="/logo.png" />
                </div>
              <div className="space-y-2 pt-1">
                <span className="text-xs uppercase tracking-widest text-[#b3ebff] font-bold">Clinical Website</span>
                <h1 className="font-headline text-2xl font-bold tracking-tight leading-snug">Sistem Informasi Rekam Medis &amp; Pelayanan Poliklinik Terpadu</h1>
                <p className="text-sm text-[#dce9ff]/80 leading-relaxed">Platform operasional terstandardisasi klinis untuk akselerasi dokumentasi SOAP, triage rawat jalan, serta pemenuhan regulasi kesehatan nasional.</p>
              </div>
            </div>
            <div className="relative z-10 py-6 space-y-3">
              {[
                ['verified_user', 'SATUSEHAT Kemenkes RI', 'Sinkronisasi langsung rekam medis nasional.'],
                ['lock', 'Enkripsi Rekam Medis End-to-End', 'Kepatuhan standar audit kerahasiaan pasien.'],
                ['hub', 'Smart Queue Multi-Spesialisasi', 'Integrasi tele-antrean, dokter, dan kasir.'],
              ].map(([icon, title, desc, badge]) => (
                <div key={title} className="flex items-start gap-3 p-3 bg-[#001637]/40 rounded-lg border border-white/10">
                  <div className="p-1.5 rounded bg-[#50d9fe]/20 text-[#b3ebff]"><span className="material-symbols-outlined text-[20px] leading-none">{icon}</span></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold truncate">{title}</p>{badge && <span className="text-xs font-medium bg-[#003320]/80 text-[#6ffbbe] px-2 py-0.5 rounded">{badge}</span>}</div>
                    <p className="text-xs text-[#dce9ff]/70">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative z-10 flex items-center justify-between text-xs text-[#dce9ff]/60"><span>Kemenkes RI</span></div>
          </div>

          <div className="lg:col-span-7 bg-white p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-[#00677d] font-bold">Portal Resmi Otorisasi</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Masuk ke Akun Medvita</h2>
              <p className="text-sm text-[#44474f] pt-1 mb-6">Masukkan kredensial klinis resmi Anda untuk mengaktifkan sesi kerja poliklinik.</p>

              {serverError && <div className="mb-4 p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/20 text-sm text-[#93000a]">{serverError}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5">Unit Pelayanan / Cabang Klinik</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#747780]"><span className="material-symbols-outlined text-sm">local_hospital</span></div>
                    <select {...register('facility')} className="w-full bg-white text-sm rounded-lg pl-10 pr-10 py-2.5 border border-[#c4c6d0] focus:border-[#00677d] outline-none">
                      <option value="bdg-central">Klinik Utama Medvita - Pusat (Bandung Dago)</option>
                      <option value="jkt-south">Klinik Pratama Medvita - Senopati Jakarta</option>
                      <option value="sby-west">Klinik Spesialis Medvita - HR Muhammad Surabaya</option>
                      <option value="dps-sunset">Medvita Diagnostic &amp; Urgent Care - Bali</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0b1c30]">ID Pengguna / Username</label>
                    <span className="text-xs text-[#747780]">Format: username terdaftar</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#747780]"><span className="material-symbols-outlined text-sm">badge</span></div>
                    <input {...register('username')} className="w-full bg-white text-sm rounded-lg pl-10 pr-3 py-2.5 border border-[#c4c6d0] focus:border-[#00677d] outline-none placeholder:text-[#747780]/60" placeholder="cth. admin / dokter / petugas" />
                  </div>
                  {errors.username && <p className="text-xs text-[#ba1a1a] mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0b1c30]">Kata Sandi Otorisasi</label>
                    <a className="text-xs font-semibold text-[#00677d] hover:underline" href="#">Lupa Kata Sandi?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#747780]"><span className="material-symbols-outlined text-sm">key</span></div>
                    <input {...register('password')} type={showPwd ? 'text' : 'password'} className="w-full bg-white text-sm rounded-lg pl-10 pr-11 py-2.5 border border-[#c4c6d0] focus:border-[#00677d] outline-none" placeholder="••••••••••••" />
                    <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#747780] hover:text-[#0b1c30]"><span className="material-symbols-outlined text-sm">{showPwd ? 'visibility_off' : 'visibility'}</span></button>
                  </div>
                  {errors.password && <p className="text-xs text-[#ba1a1a] mt-1">{errors.password.message}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#00677d]" />
                  <span className="text-sm text-[#0b1c30]">Ingat sesi kerja pada perangkat terminal ini</span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e5eeff] text-[#44474f]"><span className="w-1.5 h-1.5 rounded-full bg-[#005236]" />Terminal Terdaftar</span>
                </label>

                <div className="pt-2 space-y-3">
                  <button type="submit" disabled={isSubmitting} className="w-full bg-[#0d2b56] hover:bg-[#001637] disabled:opacity-60 text-white font-semibold text-sm py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors">
                    {isSubmitting ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Mengotentikasi...</> : <><span>Masuk ke Sistem</span><span className="material-symbols-outlined text-sm">arrow_forward</span></>}
                  </button>
                  <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#c4c6d0]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div><p className="text-xs font-semibold text-[#0b1c30]">Belum memiliki akun?</p><p className="text-xs text-[#44474f]">Registrasi akun baru untuk dokter &amp; staf pelayanan.</p></div>
                    <Link to="/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#00677d] text-[#00677d] hover:bg-[#00677d] hover:text-white text-xs font-semibold transition-colors shrink-0"><span className="material-symbols-outlined text-xs">person_add</span>Hubungi Petugas Admin</Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
