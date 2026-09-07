import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { broadcastQueueUpdate } from '../../services/queueSync'
import Navbar from '../../components/layout/Navbar'
import PatientRegistrationModal from '../../components/forms/PatientRegistrationModal'
import './DashboardPage.css'

const paymentOptions = ['BPJS', 'UMUM', 'ASURANSI']
const statusOptions = ['Menunggu', 'CheckIn', 'Pemeriksaan', 'Selesai']

const initialQueue = [
  { ticket: 'A-012', name: 'Hendra Gunawan', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '09:58 WIB', paymentType: 'BPJS', status: 'CheckIn' },
  { ticket: 'A-013', name: 'Siti Nurhaliza', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '10:02 WIB', paymentType: 'UMUM', status: 'Menunggu' },
  { ticket: 'B-008', name: 'Bambang Triyono', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '10:07 WIB', paymentType: 'ASURANSI', status: 'Menunggu' },
  { ticket: 'A-016', name: 'Ratna Dewi Sulistyo', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '10:11 WIB', paymentType: 'BPJS', status: 'Pemeriksaan' },
  { ticket: 'A-014', name: 'Fauzan Kamil', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '09:44 WIB', paymentType: 'BPJS', status: 'Selesai' },
]

const metrics = [
  { label: 'Pasien Terdaftar Hari Ini', value: '48', sub: '36 BPJS • 12 Umum', icon: 'groups', bg: 'bg-[#b3ebff]/30 text-[#00677d]' },
  { label: 'Total Tiket Antrean', value: '38', sub: '30 Selesai Terlayani', icon: 'confirmation_number', bg: 'bg-[#d7e2ff] text-[#001637]' },
  { label: 'Pasien Sedang Menunggu', value: '8', sub: 'Di Ruang Tunggu Admisi', icon: 'hourglass_top', bg: 'bg-[#50d9fe]/20 text-[#005c70]' },
  { label: 'Waktu Tunggu Rata-rata', value: '4.2 Mnt', sub: 'Target < 5.0 Mnt', icon: 'speed', bg: 'bg-[#6ffbbe]/30 text-[#005236]' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const [queue, setQueue] = useState(initialQueue)
  const [showModal, setShowModal] = useState(false)
  const [patients, setPatients] = useState([])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const handleAddPatient = (data) => {
    const nextNum = patients.length + queue.length + 1
    const newMrn = `A${String(nextNum).padStart(3, '0')}`
    const pasienName = data.pasien || data.name
    const newPatient = { id: Date.now(), mrn: newMrn, name: pasienName, ...data }
    setPatients(prev => [...prev, newPatient])
    const ticket = `A${String(nextNum).padStart(3, '0')}`
    const timeStr = data.tanggalKunjungan ? new Date(data.tanggalKunjungan).toLocaleDateString('id-ID') + ' WIB' : new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    const newQueueEntry = { ticket, name: pasienName, poli: data.poli || 'Poli Umum', doctor: data.dokter || data.doctor || 'dr. Danang Wicaksono', time: timeStr, paymentType: data.jenisPembayaran || data.paymentType || 'UMUM', status: 'Menunggu', keluhanAwal: data.keluhanAwal || '' }
    setQueue(prev => [...prev, newQueueEntry])
    return Promise.resolve()
  }

  const handleCallNext = () => {
    if (queue.length <= 1) return
    const [current, ...rest] = queue
    const next = rest[0]
    const updated = [{ ...next, status: 'CheckIn' }, ...rest.slice(1)]
    setQueue(updated)
    broadcastQueueUpdate({ type: 'CALL_NEXT', ticket: next.ticket, name: next.name })
  }

  function paymentBadge(type) {
    if (type === 'BPJS') return 'bg-[#6ffbbe]/30 text-[#005236]'
    if (type === 'ASURANSI') return 'bg-[#b3ebff]/50 text-[#004e5f]'
    return 'bg-[#dce9ff] text-[#0b1c30]'
  }

  function statusBadge(s) {
    if (s === 'Menunggu') return 'bg-[#dce9ff] text-[#44474f]'
    if (s === 'CheckIn') return 'bg-[#50d9fe]/30 text-[#005c70]'
    if (s === 'Pemeriksaan') return 'bg-[#d7e2ff] text-[#001637]'
    return 'bg-[#6ffbbe]/40 text-[#005236]'
  }

  return (
    <>
      <Navbar onAddPatient={() => setShowModal(true)} onLogout={handleLogout} />
      <div className="dashboard-page pt-16">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="dashboard-greeting">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00677d] uppercase tracking-wider mb-1">
              <span>Sistem Admisi Rawat Jalan</span>
              <span className="w-1 h-1 rounded-full bg-[#00677d]" />
              <span>Kamis, 23 Oktober 2025</span>
            </div>
            <h1 className="text-2xl font-headline font-bold text-[#001637]">Selamat Bertugas, Anita Rahmawati</h1>
            <p className="text-sm text-[#44474f] mt-0.5">Kelola antrean check-in pasien dan admisi loket secara real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <NavLink to="/queue" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#dce9ff] text-[#001637] font-semibold text-sm border border-[#c4c6d0]/40 shadow-sm hover:bg-[#d3e4fe] transition-all">
              <span className="material-symbols-outlined text-base">campaign</span> Buka Panggilan Antrean
            </NavLink>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d2b56] hover:bg-[#001637] text-white font-semibold text-sm shadow-md transition-all">
              <span className="material-symbols-outlined text-base">person_add</span> Tambah Pasien
            </button>
          </div>
        </div>

        <div className="dashboard-metrics">
          {metrics.map(m => (
            <div key={m.label} className="dashboard-metric-card">
              <div>
                <span className="text-xs font-medium text-[#44474f]">{m.label}</span>
                <div className="text-3xl font-bold font-headline text-[#001637] mt-1">{m.value}</div>
                <span className="text-xs font-semibold text-[#00677d] mt-1 block">{m.sub}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.bg}`}>
                <span className="material-symbols-outlined text-2xl">{m.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#c4c6d0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#001637]">Antrean Terkini Loket Poli Umum</h3>
              <p className="text-xs text-[#44474f] mt-0.5">Daftar antrean admisi dan verifikasi berkas pasien Poli Umum & Layanan Terpadu.</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#001637] text-white text-xs font-semibold hover:bg-[#0d2b56] shadow-sm">
              <span className="material-symbols-outlined text-base">volume_up</span> Panggil Nomor Berikutnya
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                  <th className="py-3 px-5">No. Antrean</th>
                  <th className="py-3 px-5">Waktu Check-In</th>
                  <th className="py-3 px-5">Nama Pasien / No. RM</th>
                  <th className="py-3 px-5">Poli Tujuan & Dokter</th>
                  <th className="py-3 px-5">Jenis Pembayaran</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                {queue.map((p, i) => (
                  <tr key={p.ticket} className={i === 0 ? 'bg-[#b3ebff]/10' : 'hover:bg-[#eff4ff]/40 transition-colors'}>
                    <td className="py-3.5 px-5">
                      <span className={`text-sm font-bold ${i === 0 ? 'text-[#001637]' : 'text-[#44474f]'} bg-white px-2.5 py-1 rounded-lg border ${i === 0 ? 'border-[#c4c6d0]/40' : ''}`}>{p.ticket}</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono text-[#44474f]">{p.time}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${i === 0 ? 'text-[#001637]' : ''}`}>{p.name}</span>
                        <span className="text-xs text-[#747780]">RM: #MV-{p.ticket.split('-')[1]} • NIK: 3174092408890001</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.poli}</span>
                        <span className="text-xs text-[#747780]">{p.doctor}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge(p.paymentType)}`}><span className="w-1.5 h-1.5 rounded-full bg-current" /> {p.paymentType === 'ASURANSI' ? 'Asuransi' : p.paymentType === 'BPJS' ? 'BPJS Kesehatan' : 'Umum / Mandiri'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>
                        {p.status === 'CheckIn' && <span className="w-2 h-2 rounded-full bg-current animate-pulse" />} {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {p.status === 'CheckIn' ? (
                        <button onClick={() => setQueue(q => q.map(x => x.ticket === p.ticket ? { ...x, status: 'Pemeriksaan' } : x))} className="px-2.5 py-1 rounded-lg bg-[#001637] text-white text-xs font-semibold hover:bg-[#0d2b56] shadow-sm">Mulai Periksa</button>
                      ) : p.status === 'Pemeriksaan' ? (
                        <button onClick={() => setQueue(q => q.map(x => x.ticket === p.ticket ? { ...x, status: 'Selesai' } : x))} className="px-2.5 py-1 rounded-lg bg-[#6ffbbe]/30 text-[#005236] text-xs font-semibold hover:bg-[#4edea3]/30">Selesai</button>
                      ) : p.status === 'Menunggu' ? (
                        <button onClick={() => setQueue(q => q.map(x => x.ticket === p.ticket ? { ...x, status: 'CheckIn' } : x))} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#001637] text-xs font-semibold"><span className="material-symbols-outlined text-base">campaign</span>Check In</button>
                      ) : (
                        <span className="text-xs text-[#44474f]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto">
            <div className="flex justify-center py-3">
            </div>
          </div>
          <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#44474f] gap-3">
            <span>Menampilkan <b className="text-[#0b1c30]">{queue.length}</b> dari <b className="text-[#0b1c30]">38</b> pendaftaran hari ini</span>
            <div className="flex items-center gap-1">
              <span className="px-3 py-1.5 rounded-lg bg-[#001637] text-white font-bold">1</span>
              <button className="px-2.5 py-1.5 rounded-lg border border-[#c4c6d0]/30 hover:bg-[#dce9ff]">2</button>
              <button className="px-2.5 py-1.5 rounded-lg border border-[#c4c6d0]/30 hover:bg-[#dce9ff]">Berikutnya</button>
            </div>
          </div>
        </div>
      </div>
    </div>
      <PatientRegistrationModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleAddPatient} patientCount={patients.length} />
    </>
  )
}