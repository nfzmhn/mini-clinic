import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPatients, updatePatient, deletePatient } from '../../../services/patient'
import './MasterPatientsPage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function calcAge(birthDate) {
  if (!birthDate) return '-'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function MasterPatientsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const user = getUser()

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', nik: '', gender: 'L', birthDate: '', phone: '', address: '' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const { data: patientsData, isLoading } = useQuery({
    queryKey: ['admin-patients', search],
    queryFn: async () => {
      const res = await getPatients({ q: search, limit: 100 })
      return Array.isArray(res) ? res : (res?.data?.data || res?.data || [])
    },
  })

  const patients = Array.isArray(patientsData) ? patientsData : []

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePatient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-patients'] })
      showToast('Data pasien berhasil diperbarui!')
      setEditing(null)
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal update pasien'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-patients'] })
      showToast('Pasien berhasil dihapus dari master!')
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal hapus pasien'),
  })

  const openEdit = (p) => {
    setEditing(p)
    setEditForm({ name: p.name, nik: p.nik, gender: p.gender || 'L', birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '', phone: p.phone || '', address: p.address || '' })
  }

  const saveEdit = (e) => {
    e.preventDefault()
    if (!editForm.nik || !editForm.name) return showToast('NIK dan Nama wajib diisi!')
    updateMut.mutate({ id: editing.id, data: editForm })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-page">
      {toast && <div className="admin-toast"><span className="material-symbols-outlined text-[#50d9fe]">verified</span>{toast}</div>}

      <aside className="admin-sidebar">
        <div className="flex flex-col">
          <div className="h-16 px-6 flex items-center gap-3 bg-white border-b border-[#c4c6d0]/20">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white"><span className="material-symbols-outlined text-[20px]">admin_panel_settings</span></div>
            <div className="flex flex-col"><span className="font-headline text-[0.95rem] font-bold text-primary tracking-tight">MEDVITA ADMIN</span><span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Master Control</span></div>
          </div>
          <div className="p-4">
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center justify-between">
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Login Sebagai</span><span className="text-sm font-bold text-primary">{user?.username || 'Admin'}</span></div>
            </div>
          </div>
          <nav className="px-3 space-y-1">
            <NavLink to="/admin/dashboard" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">dashboard</span>Dashboard Sistem</NavLink>
            <NavLink to="/admin/patients" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">group</span>Master Data Pasien</NavLink>
            <NavLink to="/admin/polis" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">local_hospital</span>Master Poliklinik</NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[20px]">badge</span>Manajemen Pengguna</NavLink>
            <button onClick={handleLogout} className="admin-nav-link admin-nav-link--danger mt-4 w-full text-left"><span className="material-symbols-outlined text-[20px]">logout</span>Keluar Sistem</button>
          </nav>
        </div>
        <div className="p-4 bg-[#eff4ff]/60">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse" /><span className="text-xs font-bold text-primary">Database MySQL</span></div>
            <span className="text-[10px] font-bold text-secondary uppercase">Connected</span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">Master Data Pasien Terpusat</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff]/40 text-[#005c70] text-xs font-bold">Total: {patients.length} Pasien</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right leading-none"><span className="text-sm font-bold text-primary">{user?.username || 'Admin'}</span><br/><span className="text-xs text-[#44474f]">Administrator</span></div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{(user?.username || 'A').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <main className="admin-content">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline text-2xl font-bold text-primary">Manajemen Master Data Pasien</h1>
            <p className="text-sm text-[#44474f]">Kelola rekam identitas dan data pasien dari database.</p>
          </div>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#c4c6d0]/30 flex flex-col md:flex-row items-center justify-between gap-3">
            <form onSubmit={e => { e.preventDefault(); setSearch(searchInput) }} className="relative flex-1 w-full flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari nama, NIK 16 digit, atau nomor rekam medis..." />
              </div>
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#0d2b56] text-white text-sm font-semibold">Cari</button>
              {search && <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="px-3 py-2.5 rounded-xl bg-[#eff4ff] text-[#44474f] text-sm">Reset</button>}
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3.5 px-5">No. Rekam Medis</th>
                    <th className="py-3.5 px-5">Nama Pasien / NIK</th>
                    <th className="py-3.5 px-5">Gender & Usia</th>
                    <th className="py-3.5 px-5">No. Telepon</th>
                    <th className="py-3.5 px-5">Alamat Domisili</th>
                    <th className="py-3.5 px-5 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-10 text-center text-sm text-[#44474f]">Memuat data pasien...</td></tr>
                  ) : patients.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-sm text-[#747780]">{search ? 'Tidak ada pasien cocok pencarian.' : 'Belum ada data pasien.'}</td></tr>
                  ) : patients.map(p => (
                    <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                      <td className="py-4 px-5"><span className="text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{p.mrn}</span></td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col"><span className="font-semibold text-primary">{p.name}</span><span className="text-xs text-[#747780]">NIK: {p.nik}</span></div>
                      </td>
                      <td className="py-4 px-5"><span className="text-sm font-medium">{p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} {p.birthDate ? `(${calcAge(p.birthDate)} Thn)` : ''}</span></td>
                      <td className="py-4 px-5 font-mono text-xs text-[#44474f]">{p.phone || '-'}</td>
                      <td className="py-4 px-5 text-xs text-[#44474f] max-w-xs truncate">{p.address || '-'}</td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#44474f]" title="Edit Pasien"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => { if (window.confirm(`Hapus pasien ${p.name} (${p.mrn})?`)) deleteMut.mutate(p.id) }} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b>{patients.length}</b> data master pasien terdaftar</span>
            </div>
          </section>
        </main>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">edit</span><h3 className="font-headline font-bold text-lg">Edit Master Pasien — {editing.mrn}</h3></div>
              <button onClick={() => setEditing(null)} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">NIK 16 Digit</label>
                  <input value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} maxLength={16} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Nama Lengkap</label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Gender</label>
                  <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option value="L">Laki-laki (L)</option><option value="P">Perempuan (P)</option></select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Tanggal Lahir</label>
                  <input type="date" value={editForm.birthDate} onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">No. Telepon</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" placeholder="0812..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Alamat Domisili</label>
                <textarea rows={2} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm resize-none" />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" disabled={updateMut.isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56] disabled:opacity-50">
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
