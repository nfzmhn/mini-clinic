import { useState } from 'react'
import { z } from 'zod'
import PatientRegistrationModal from '../../components/forms/PatientRegistrationModal'
import './PatientsPage.css'

const schema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  name: z.string().min(3, 'Nama pasien wajib diisi'),
  gender: z.enum(['L', 'P']),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  address: z.string().min(5, 'Alamat wajib diisi'),
})

const initialPatients = [
  { id: 1, mrn: 'RM-2024-00142', nik: '3273251208890003', name: 'Bambang Sugianto', gender: 'L', birthDate: '1989-05-14', phone: '0812-8921-4320', address: 'Jl. Dipati Ukur No. 45, Coblong, Bandung', paymentType: 'BPJS', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '09:58 WIB', status: 'CheckIn' },
  { id: 2, mrn: 'RM-2024-00143', nik: '3171054902950002', name: 'Dewi Wulandari', gender: 'P', birthDate: '1995-02-09', phone: '0857-1120-9944', address: 'Komp. Antapani Mas B-12, Antapani', paymentType: 'ASURANSI', poli: 'Poli Gigi', doctor: 'drg. Siti Lestari', time: '10:02 WIB', status: 'Menunggu' },
  { id: 3, mrn: 'RM-2024-00144', nik: '3273010403560001', name: 'H. Nurdin Iskandar', gender: 'L', birthDate: '1956-03-04', phone: '0813-2289-7711', address: 'Jl. Buah Batu No. 110A, Bandung', paymentType: 'UMUM', poli: 'Poli Anak', doctor: 'dr. Rina Amelia, Sp.A', time: '10:07 WIB', status: 'Pemeriksaan' },
  { id: 4, mrn: 'RM-2024-00145', nik: '3273123456000004', name: 'Siti Aminah', gender: 'P', birthDate: '1980-08-14', phone: '0821-4455-6677', address: 'Griya Cempaka Arum Blok B4', paymentType: 'BPJS', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: '09:44 WIB', status: 'Selesai' },
]

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

export default function PatientsPage() {
  const [patients, setPatients] = useState(initialPatients)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const handleAddPatient = (data) => {
    const nextMrn = `A${String(patients.length + 1).padStart(3, '0')}`
    setPatients(prev => [{ id: Date.now(), mrn: nextMrn, ...data, paymentType: 'BPJS', poli: 'Poli Umum', doctor: 'dr. Danang Wicaksono', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB', status: 'Menunggu' }, ...prev])
    return Promise.resolve()
  }

  const filtered = patients.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.nik.includes(search) ||
    p.mrn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-headline text-[#001637]">Master Data Rekam Medis Pasien</span>
            <span className="px-2 py-0.5 rounded-full bg-[#b3ebff] text-[#001f27] text-xs font-semibold">Live v2.4</span>
          </div>
          <p className="text-sm text-[#44474f]">Kelola data identitas, rekam medis, dan riwayat pasien terdaftar secara komprehensif.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#dce9ff] text-[#001637] text-sm font-semibold border border-[#c4c6d0]/40"><span className="material-symbols-outlined text-base">file_download</span>Ekspor Excel</button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#001637] text-white text-sm font-semibold shadow-md" onClick={() => setShowModal(true)}><span className="material-symbols-outlined text-base">person_add</span> Tambah Pasien Baru</button>
        </div>
      </div>

      <div className="patients-toolbar">
        <div className="patients-toolbar__search">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474f] text-lg pointer-events-none">search</span>
          <input placeholder="Cari nama lengkap pasien, NIK 16 digit, atau No. RM..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="patients-toolbar__filters">
          <div className="filter-chip"><span className="material-symbols-outlined text-base text-[#00677d]">wc</span><select><option>Semua Gender</option><option>L</option><option>P</option></select></div>
          <button className="p-2.5 rounded-lg bg-[#eff4ff] text-[#44474f]" title="Reset"><span className="material-symbols-outlined text-base">filter_alt_off</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/60 text-[#747780] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                <th className="py-3 px-5">No. Rekam Medis</th>
                <th className="py-3 px-5">Waktu Daftar</th>
                <th className="py-3 px-5">Nama Pasien / No. RM</th>
                <th className="py-3 px-5">Poli Tujuan &amp; Dokter</th>
                <th className="py-3 px-5">Jenis Pembayaran</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="text-sm font-bold text-[#001637] bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{p.mrn}</span>
                  </td>
                  <td className="py-3.5 px-5 text-xs font-mono text-[#44474f]">{p.time}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#001637]">{p.name}</span>
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
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge(p.paymentType)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" /> {p.paymentType === 'ASURANSI' ? 'Asuransi' : p.paymentType === 'BPJS' ? 'BPJS Kesehatan' : 'Umum / Mandiri'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>
                      {p.status === 'Terverifikasi' && <span className="material-symbols-outlined text-xs">check</span>} {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-[#e5eeff] text-[#44474f]"><span className="material-symbols-outlined text-base">edit</span></button>
                      <button className="p-1.5 rounded-lg hover:bg-[#e5eeff] text-[#44474f]"><span className="material-symbols-outlined text-base">more_vert</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#44474f] gap-3">
          <span>Menampilkan <b className="text-[#0b1c30]">{filtered.length}</b> dari <b className="text-[#0b1c30]">{patients.length}</b> pasien</span>
          <div className="flex items-center gap-1">
            <span className="px-3 py-1.5 rounded-lg bg-[#001637] text-white font-bold">1</span>
            <button className="px-2.5 py-1.5 rounded-lg border border-[#c4c6d0]/30 hover:bg-[#dce9ff]">2</button>
          </div>
        </div>
      </div>

      <PatientRegistrationModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleAddPatient} patientCount={patients.length} />
    </div>
  )
}
