import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import { getPatients, createPatient, updatePatient, deletePatient } from '../../../services/patient'
import PatientRegistrationModal from '../registration/PatientRegistrationModal'
import './PatientsPage.css'

function paymentBadge(type) {
  if (type === 'BPJS') return 'bg-[#6ffbbe]/30 text-[#005236]'
  if (type === 'ASURANSI') return 'bg-[#b3ebff]/50 text-[#004e5f]'
  return 'bg-[#dce9ff] text-[#0b1c30]'
}

function calcAge(birthDate) {
  if (!birthDate) return '-'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientsPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', nik: '', gender: 'L', birthDate: '', phone: '', address: '' })
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // Fetch patients from API
  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['patients', search],
    queryFn: async () => {
      const res = await getPatients({ q: search, limit: 50 })
      const list = Array.isArray(res) ? res : (res?.data?.data || res?.data || [])
      return list
    },
  })

  const patients = Array.isArray(patientsData) ? patientsData : []

  // Add patient via modal — creates patient record only (no registration here)
  const createMut = useMutation({
    mutationFn: (data) => createPatient({
      name: data.pasien || data.name,
      nik: data.nik,
      gender: data.gender || 'L',
      birthDate: data.birthDate || '1990-01-01',
      phone: data.phone || '',
      address: data.address || '',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      showToast('Pasien baru berhasil ditambahkan!')
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal menambahkan pasien'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePatient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      showToast('Data pasien berhasil diperbarui!')
      setEditing(null)
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal update pasien'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      showToast('Pasien berhasil dihapus!')
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal hapus pasien'),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const openEdit = (p) => {
    setEditing(p)
    setEditForm({
      name: p.name || '',
      nik: p.nik || '',
      gender: p.gender || 'L',
      birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
      phone: p.phone || '',
      address: p.address || '',
    })
  }

  const saveEdit = (e) => {
    e.preventDefault()
    if (!editForm.name || !editForm.nik) return showToast('Nama dan NIK wajib diisi!')
    updateMut.mutate({ id: editing.id, data: editForm })
  }

  return (
    <div className="flex flex-col gap-6">
      {toast && <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-[#001637] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold"><span className="material-symbols-outlined text-[#50d9fe]">verified</span>{toast}</div>}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-headline text-[#001637]">Master Data Pasien</span>
            <span className="px-2 py-0.5 rounded-full bg-[#b3ebff] text-[#001f27] text-xs font-semibold">{patients.length} data</span>
          </div>
          <p className="text-sm text-[#44474f]">Kelola data identitas dan riwayat pasien terdaftar.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#001637] text-white text-sm font-semibold shadow-md" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined text-base">person_add</span> Tambah Pasien Baru
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="patients-toolbar">
        <div className="patients-toolbar__search">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474f] text-lg pointer-events-none">search</span>
          <input
            placeholder="Cari nama, NIK, atau No. RM..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-xl bg-[#0d2b56] text-white text-sm font-semibold">Cari</button>
        {search && <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="px-3 py-2 rounded-xl bg-[#eff4ff] text-[#44474f] text-sm">Reset</button>}
      </form>

      <div className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/60 text-[#747780] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                <th className="py-3 px-5">No. Rekam Medis</th>
                <th className="py-3 px-5">Nama Pasien / NIK</th>
                <th className="py-3 px-5">Gender & Usia</th>
                <th className="py-3 px-5">No. Telepon</th>
                <th className="py-3 px-5">Alamat</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
              {isLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-[#44474f]">Memuat data pasien...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-3xl text-[#c4c6d0]">group_off</span>
                    <span className="text-sm font-semibold text-[#44474f]">{search ? 'Tidak ada pasien cocok pencarian' : 'Belum ada data pasien'}</span>
                  </div>
                </td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="text-sm font-bold text-[#001637] bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{p.mrn}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#001637]">{p.name}</span>
                      <span className="text-xs text-[#747780]">NIK: {p.nik}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-sm">
                    {p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} {p.birthDate ? `(${calcAge(p.birthDate)} Thn)` : ''}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-[#44474f]">{p.phone || '-'}</td>
                  <td className="py-3.5 px-5 text-xs text-[#44474f] max-w-xs truncate">{p.address || '-'}</td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#e5eeff] text-[#44474f]" title="Edit">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => { if (window.confirm(`Hapus pasien ${p.name}?`)) deleteMut.mutate(p.id) }} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 text-xs text-[#44474f]">
          <span>Menampilkan <b className="text-[#0b1c30]">{patients.length}</b> pasien</span>
        </div>
      </div>

      {/* Add Patient Modal — khusus untuk tambah data pasien saja */}
      <PatientRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (data) => {
          await createMut.mutateAsync(data)
          setShowModal(false)
        }}
        patientOnly
      />

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-[#001637] text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">edit</span><h3 className="font-headline font-bold text-lg">Edit Pasien — {editing.mrn}</h3></div>
              <button onClick={() => setEditing(null)} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#001637] mb-1">NIK 16 Digit <span className="text-red-500">*</span></label>
                  <input value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} maxLength={16} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#001637] mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#001637] mb-1">Gender</label>
                  <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm">
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#001637] mb-1">Tanggal Lahir</label>
                  <input type="date" value={editForm.birthDate} onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#001637] mb-1">No. Telepon</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#001637] mb-1">Alamat</label>
                <textarea rows={2} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#001637] text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" disabled={updateMut.isPending} className="px-5 py-2 rounded-xl bg-[#001637] text-white text-sm font-bold shadow-md hover:bg-[#0d2b56] disabled:opacity-50">
                  {updateMut.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
