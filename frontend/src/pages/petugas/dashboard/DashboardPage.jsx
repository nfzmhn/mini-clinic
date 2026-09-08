import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { broadcastQueueUpdate } from '../../../services/queueSync'
import { getRegistrations, updateRegistrationStatus, callNextQueue } from '../../../services/registration'
import api from '../../../services/api'
import Navbar from '../../../components/layout/Navbar'
import PatientRegistrationModal from '../registration/PatientRegistrationModal'
import './DashboardPage.css'

function formatTime(dateStr) {
  try { return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' } catch { return '-' }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ['registrations'],
    queryFn: async () => {
      const res = await getRegistrations()
      return res.data || res
    },
  })

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data.data || data
    },
  })

  const regs = Array.isArray(queueData) ? queueData : queueData?.data || []
  const queue = regs.map(r => ({
    id: r.id,
    ticket: r.queueNumber,
    name: r.patient?.name || '-',
    mrn: r.patient?.mrn || '-',
    nik: r.patient?.nik || '-',
    poli: r.poli?.name || '-',
    doctor: r.doctor?.username ? `dr. ${r.doctor.username}` : '-',
    time: formatTime(r.visitDate || r.createdAt),
    paymentType: r.paymentType,
    status: r.status,
  }))

  const stats = statsData ? [
    { label: 'Pasien Terdaftar Hari Ini', value: String(statsData.patients ?? regs.length), sub: `${regs.filter(x=>x.paymentType==='BPJS').length} BPJS • ${regs.filter(x=>x.paymentType!=='BPJS').length} Umum`, icon: 'groups', bg: 'bg-[#b3ebff]/30 text-[#00677d]' },
    { label: 'Total Tiket Antrean', value: String(statsData.registrations ?? regs.length), sub: `${regs.filter(x=>x.status==='Selesai').length} Selesai Terlayani`, icon: 'confirmation_number', bg: 'bg-[#d7e2ff] text-[#001637]' },
    { label: 'Pasien Sedang Menunggu', value: String(statsData.menunggu ?? regs.filter(x=>x.status==='Menunggu').length), sub: 'Di Ruang Tunggu Admisi', icon: 'hourglass_top', bg: 'bg-[#50d9fe]/20 text-[#005c70]' },
    { label: 'Waktu Tunggu Rata-rata', value: '4.2 Mnt', sub: 'Target < 5.0 Mnt', icon: 'speed', bg: 'bg-[#6ffbbe]/30 text-[#005236]' },
  ] : [
    { label: 'Pasien Terdaftar Hari Ini', value: String(regs.length), sub: '-', icon: 'groups', bg: 'bg-[#b3ebff]/30 text-[#00677d]' },
    { label: 'Total Tiket Antrean', value: String(regs.length), sub: '-', icon: 'confirmation_number', bg: 'bg-[#d7e2ff] text-[#001637]' },
    { label: 'Pasien Sedang Menunggu', value: String(regs.filter(x=>x.status==='Menunggu').length), sub: 'Di Ruang Tunggu Admisi', icon: 'hourglass_top', bg: 'bg-[#50d9fe]/20 text-[#005c70]' },
    { label: 'Waktu Tunggu Rata-rata', value: '4.2 Mnt', sub: 'Target < 5.0 Mnt', icon: 'speed', bg: 'bg-[#6ffbbe]/30 text-[#005236]' },
  ]

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateRegistrationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['registrations'] }),
  })

  const callNextMut = useMutation({
    mutationFn: () => callNextQueue(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['registrations'] })
      const r = res.data || res
      if (r?.queueNumber) broadcastQueueUpdate({ type: 'CALL_NEXT', ticket: r.queueNumber, name: r.patient?.name || '' })
    },
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const handleAddPatient = async (data) => {
    try {
      // 1. Create/Check Patient
      let patient
      const searchRes = await api.get('/patients', { params: { q: data.nik || data.name } })
      const searchResults = Array.isArray(searchRes.data) ? searchRes.data : (searchRes.data?.data?.data || searchRes.data?.data || [])
      const existing = searchResults.find(p => p.nik === data.nik)

      if (existing) {
        patient = existing
      } else {
        const pRes = await api.post('/patients', {
          name: data.name,
          nik: data.nik,
          gender: data.gender || 'L',
          birthDate: data.birthDate || '1990-01-01',
          phone: data.phone || '',
          address: data.address || '-'
        })
        patient = pRes.data?.data || pRes.data
      }

      // 2. Create Registration with doctorId and poliId from modal selection
      await api.post('/registrations', {
        patientId: patient.id,
        doctorId: data.doctorId,   // real doctor ID from modal dropdown
        poliId: data.poliId,       // real poli ID from modal dropdown
        paymentType: data.paymentType,
        complaint: data.keluhanAwal
      })

      qc.invalidateQueries({ queryKey: ['registrations'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    } catch (e) {
      console.error(e)
      throw e
    }
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
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl font-headline font-bold text-[#001637]">Selamat Bertugas, Petugas</h1>
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
          {stats.map(m => (
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
              <h3 className="text-base font-bold text-[#001637]">Antrean Terkini</h3>
              <p className="text-xs text-[#44474f] mt-0.5">Daftar antrean admisi dari database MySQL — kode format A-0001.</p>
            </div>
            <button onClick={() => callNextMut.mutate()} disabled={callNextMut.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#001637] text-white text-xs font-semibold hover:bg-[#0d2b56] shadow-sm disabled:opacity-50">
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
                {queueLoading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-sm text-[#44474f]">Memuat antrean...</td></tr>
                ) : queue.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center"><div className="flex flex-col items-center gap-2"><span className="material-symbols-outlined text-3xl text-[#c4c6d0]">inbox</span><span className="text-sm font-semibold text-[#44474f]">Belum ada antrean hari ini</span><span className="text-xs text-[#747780]">Tambah pasien untuk generate kode A-0001 otomatis.</span></div></td></tr>
                ) : queue.map((p, i) => (
                  <tr key={p.id} className={i === 0 ? 'bg-[#b3ebff]/10' : 'hover:bg-[#eff4ff]/40 transition-colors'}>
                    <td className="py-3.5 px-5">
                      <span className={`text-sm font-bold ${i === 0 ? 'text-[#001637]' : 'text-[#44474f]'} bg-white px-2.5 py-1 rounded-lg border ${i === 0 ? 'border-[#c4c6d0]/40' : ''}`}>{p.ticket}</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono text-[#44474f]">{p.time}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${i === 0 ? 'text-[#001637]' : ''}`}>{p.name}</span>
                        <span className="text-xs text-[#747780]">RM: {p.mrn} • NIK: {p.nik}</span>
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
                        <button onClick={() => statusMut.mutate({ id: p.id, status: 'Pemeriksaan' })} className="px-2.5 py-1 rounded-lg bg-[#001637] text-white text-xs font-semibold hover:bg-[#0d2b56] shadow-sm">Mulai Periksa</button>
                      ) : p.status === 'Pemeriksaan' ? (
                        <button onClick={() => statusMut.mutate({ id: p.id, status: 'Selesai' })} className="px-2.5 py-1 rounded-lg bg-[#6ffbbe]/30 text-[#005236] text-xs font-semibold hover:bg-[#4edea3]/30">Selesai</button>
                      ) : p.status === 'Menunggu' ? (
                        <button onClick={() => statusMut.mutate({ id: p.id, status: 'CheckIn' })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#001637] text-xs font-semibold"><span className="material-symbols-outlined text-base">campaign</span>Check In</button>
                      ) : (
                        <span className="text-xs text-[#44474f]">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#44474f] gap-3">
            <span>Menampilkan <b className="text-[#0b1c30]">{queue.length}</b> pendaftaran hari ini • Kode antrean DB: A-0001</span>
            <span className="text-[#747780]">Sinkron MySQL • auto-generate per poli per hari</span>
          </div>
        </div>
      </div>
    </div>
      <PatientRegistrationModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleAddPatient} />
    </>
  )
}