import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRegistrations } from '../../../services/registration'
import './DoctorQueuePage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function statusBadge(s) {
  if (s === 'Menunggu') return 'bg-[#dce9ff] text-[#44474f]'
  if (s === 'CheckIn') return 'bg-[#50d9fe]/30 text-[#005c70]'
  if (s === 'Pemeriksaan') return 'bg-[#d7e2ff] text-[#001637]'
  return 'bg-[#6ffbbe]/40 text-[#005236]'
}

function formatTime(dateStr) {
  try { return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' } catch { return '-' }
}

export default function DoctorQueuePage() {
  const navigate = useNavigate()
  const user = getUser()

  // Format tanggal lokal (bukan UTC) agar filter hari ini akurat
  const today = (() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  })()

  const { data: regData, isLoading } = useQuery({
    queryKey: ['doctor-queue', user?.id],
    queryFn: async () => {
      const res = await getRegistrations({ doctorId: user?.id, date: today })
      return Array.isArray(res) ? res : (res?.data?.data || res?.data || [])
    },
    refetchInterval: 8000,          // auto-refresh tiap 8 detik
    refetchOnWindowFocus: true,     // refresh saat tab aktif kembali
  })

  // Tampilkan semua kecuali Selesai (Menunggu + CheckIn + Pemeriksaan)
  const allQueue = Array.isArray(regData) ? regData : []
  const queue = allQueue.filter(q => q.status !== 'Selesai')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="doctor-page">
      <aside className="doctor-sidebar">
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center gap-3 bg-white border-b border-[#c4c6d0]/20">
            <img alt="Medvita" className="h-8 w-auto object-contain" src="/logo.png" />
            <div className="flex flex-col"><span className="font-headline text-[1.05rem] font-bold text-primary leading-none">Medvita</span><span className="text-[0.68rem] font-bold text-secondary tracking-widest uppercase">Clinical OS</span></div>
          </div>
          <div className="p-4">
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Dokter</span>
                <span className="text-sm font-bold text-primary">{user?.username || 'Dokter'}</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00a874] ring-4 ring-[#6ffbbe]/40" />
            </div>
          </div>
          <nav className="px-2 space-y-1">
            <NavLink to="/doctor/queue" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">format_list_numbered</span>Antrean Pasien</NavLink>
            <NavLink to="/doctor" end className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">clinical_notes</span>Formulir SOAP</NavLink>
            <NavLink to="/records" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">folder_shared</span>Rekam Medis</NavLink>
            <button onClick={handleLogout} className="doctor-nav-link doctor-nav-link--danger w-full text-left"><span className="material-symbols-outlined text-[1.25rem]">logout</span>Keluar</button>
          </nav>
        </div>
      </aside>

      <div className="doctor-main">
        <header className="doctor-topbar">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] rounded-full"><span className="h-2 w-2 rounded-full bg-[#00a874] animate-pulse" /><span className="text-xs font-bold text-[#005236]">Sesi Terbuka</span></span>
            <span className="hidden md:inline text-sm text-[#44474f]">Modul Pemeriksaan Rawat Jalan</span>
          </div>
          <div className="flex items-center gap-2.5 text-right">
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-bold text-primary">{user?.username || 'Dokter'}</span>
              <span className="text-xs text-[#44474f]">Dokter Penanggung Jawab</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#b3ebff]/50 flex items-center justify-center text-secondary ring-2 ring-[#50d9fe]/30"><span className="material-symbols-outlined text-[1.2rem]">person</span></div>
          </div>
        </header>

        <main className="doctor-content">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-xl font-bold text-primary">Antrean Pasien — {user?.username || 'Dokter'}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6ffbbe]/20 border border-[#00a874]/20 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#00a874] animate-pulse" />
                <span className="text-xs font-semibold text-[#005236]">Live · refresh tiap 8 detik</span>
              </span>
            </div>
            <p className="text-sm text-[#44474f]">Pasien yang dialokasikan ke dokter ini hari ini. Halaman otomatis diperbarui.</p>
          </div>

          <section className="bg-white rounded-xl border border-[#c4c6d0]/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3 px-5">No. Antrean</th>
                    <th className="py-3 px-5">Waktu Check-In</th>
                    <th className="py-3 px-5">Nama Pasien & NIK</th>
                    <th className="py-3 px-5">Poli Tujuan</th>
                    <th className="py-3 px-5">Pembayaran</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {isLoading ? (
                    <tr><td colSpan={7} className="py-10 text-center text-sm text-[#44474f]">Memuat antrean...</td></tr>
                  ) : queue.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#c4c6d0]">inbox</span>
                        <span className="text-sm font-semibold text-[#44474f]">Belum ada antrean untuk dokter ini hari ini</span>
                      </div>
                    </td></tr>
                  ) : queue.map(q => (
                    <tr key={q.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-3.5 px-5"><span className="text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{q.queueNumber}</span></td>
                      <td className="py-3.5 px-5 text-xs font-mono text-[#44474f]">{formatTime(q.visitDate || q.createdAt)}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary">{q.patient?.name || '-'}</span>
                          <span className="text-xs text-[#747780]">NIK: {q.patient?.nik || '-'} • {q.patient?.mrn || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-sm font-medium">{q.poli?.name || '-'}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-semibold">{q.paymentType}</span>
                      </td>
                      <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(q.status)}`}>{q.status}</span></td>
                      <td className="py-3.5 px-5 text-right">
                        {(q.status === 'CheckIn' || q.status === 'Pemeriksaan') && (
                          <button
                            onClick={() => navigate(`/doctor?registrationId=${q.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#001637] text-white text-xs font-semibold hover:bg-[#0d2b56]"
                          >
                            Mulai Periksa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Antrean aktif: <b className="text-[#0b1c30]">{queue.length}</b> pasien • Total hari ini: <b className="text-[#0b1c30]">{allQueue.length}</b></span>
              <span className="text-[#747780]">Filter: doctorId={user?.id} · tanggal={today}</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
