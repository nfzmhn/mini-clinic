import { NavLink } from 'react-router-dom'
import './DoctorQueuePage.css'

const queueData = [
  { no: 'A-012', time: '08:15 WIB', name: 'Budi Pratama', nik: '3271021405900003', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono, Sp.PD', status: 'CheckIn' },
  { no: 'A-013', time: '08:42 WIB', name: 'Siti Aminah', nik: '3271021405900004', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono, Sp.PD', status: 'Menunggu' },
  { no: 'A-014', time: '09:05 WIB', name: 'Hendra Gunawan', nik: '3271021405900005', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono, Sp.PD', status: 'Menunggu' },
  { no: 'A-015', time: '09:18 WIB', name: 'Ratna Sari', nik: '3271021405900006', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono, Sp.PD', status: 'Menunggu' },
]

function statusBadge(s) {
  if (s === 'Menunggu') return 'bg-[#dce9ff] text-[#44474f]'
  if (s === 'CheckIn') return 'bg-[#50d9fe]/30 text-[#005c70]'
  if (s === 'Pemeriksaan') return 'bg-[#d7e2ff] text-[#001637]'
  return 'bg-[#6ffbbe]/40 text-[#005236]'
}

export default function DoctorQueuePage() {
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
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Lokasi Praktik</span><span className="text-sm font-bold text-primary">Poli Umum R.01</span></div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00a874] ring-4 ring-[#6ffbbe]/40" />
            </div>
          </div>
          <nav className="px-2 space-y-1">
            <NavLink to="/doctor/queue" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">format_list_numbered</span>Antrean Pasien</NavLink>
            <NavLink to="/doctor" end className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">clinical_notes</span>Formulir SOAP</NavLink>
            <NavLink to="/records" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">folder_shared</span>Rekam Medis</NavLink>
            <NavLink to="/login" className="doctor-nav-link doctor-nav-link--danger"><span className="material-symbols-outlined text-[1.25rem]">logout</span>Keluar</NavLink>
          </nav>
        </div>
      </aside>

      <div className="doctor-main">
        <header className="doctor-topbar">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] rounded-full"><span className="h-2 w-2 rounded-full bg-[#00a874] animate-pulse" /><span className="text-xs font-bold text-[#005236]">Sesi Terbuka</span></span>
            <span className="hidden md:inline text-sm text-[#44474f]">Modul Pemeriksaan Rawat Jalan</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 bg-[#eff4ff] px-3 py-1.5 rounded-lg text-[#44474f]"><span className="material-symbols-outlined text-[1.05rem]">badge</span><span className="text-xs font-bold">SIP: 446.1/4092/Dinkes/2023</span></div>
            <div className="h-8 w-px bg-[#dce9ff] hidden md:block" />
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:flex flex-col leading-none"><span className="text-sm font-bold text-primary">dr. Danang Wicaksono, Sp.PD</span><span className="text-xs text-[#44474f]">Dokter Penanggung Jawab Pelayanan</span></div>
              <div className="w-8 h-8 rounded-full bg-[#b3ebff]/50 flex items-center justify-center text-secondary ring-2 ring-[#50d9fe]/30"><span className="material-symbols-outlined text-[1.2rem]">person</span></div>
            </div>
          </div>
        </header>

        <main className="doctor-content">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline text-xl font-bold text-primary">Antrean Pasien — dr. Danang Wicaksono, Sp.PD</h1>
            <p className="text-sm text-[#44474f]">Hanya pasien dengan dokter terpilih. Tanpa aksi ke Data Pasien.</p>
          </div>

          <section className="bg-white rounded-xl border border-[#c4c6d0]/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3 px-5">No. Antrean</th>
                    <th className="py-3 px-5">Waktu Check-In</th>
                    <th className="py-3 px-5">Nama Pasien & NIK</th>
                    <th className="py-3 px-5">Poli Tujuan & Dokter</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {queueData.map(q => (
                    <tr key={q.no} className="hover:bg-[#eff4ff]/40">
                      <td className="py-3.5 px-5"><span className="text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{q.no}</span></td>
                      <td className="py-3.5 px-5 text-xs font-mono text-[#44474f]">{q.time}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col"><span className="font-semibold text-primary">{q.name}</span><span className="text-xs text-[#747780]">NIK: {q.nik}</span></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col"><span className="font-medium">{q.poli}</span><span className="text-xs text-[#747780]">{q.doctor}</span></div>
                      </td>
                      <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(q.status)}`}>{q.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b className="text-[#0b1c30]">{queueData.length}</b> antrean untuk dokter ini</span>
              <span className="text-[#747780]">Filter by doctor_id</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
