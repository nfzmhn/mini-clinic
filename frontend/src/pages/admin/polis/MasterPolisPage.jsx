import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPolis, createPoli, updatePoli, deletePoli } from '../../../services/poli'
import { getUsers } from '../../../services/user'
import './MasterPolisPage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export default function MasterPolisPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const user = getUser()

  const [search, setSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', status: 'Aktif' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // Load polis from API
  const { data: polisData, isLoading } = useQuery({
    queryKey: ['admin-polis'],
    queryFn: async () => {
      const res = await getPolis()
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  // Load doctors from API
  const { data: doctorsData } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: async () => {
      const res = await getUsers({ role: 'DOCTOR' })
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  const polis = Array.isArray(polisData) ? polisData : []
  const doctors = Array.isArray(doctorsData) ? doctorsData : []

  const filtered = polis.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  const filteredDoctors = doctors.filter(d => !doctorSearch || d.username.toLowerCase().includes(doctorSearch.toLowerCase()) || (d.poli?.name || '').toLowerCase().includes(doctorSearch.toLowerCase()))

  const createMut = useMutation({
    mutationFn: (data) => createPoli(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-polis'] }); showToast(`Poliklinik berhasil ditambahkan!`); closeModal() },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal menambahkan poli'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePoli(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-polis'] }); showToast('Poli berhasil diperbarui!'); closeModal() },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal update poli'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deletePoli(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-polis'] }); showToast('Poli berhasil dihapus!') },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal hapus poli'),
  })

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', status: 'Aktif' }); setShowModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, code: p.code, status: 'Aktif' }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name || !form.code) return showToast('Nama dan Kode poli wajib diisi!')
    if (editing) {
      updateMut.mutate({ id: editing.id, data: { name: form.name, code: form.code } })
    } else {
      createMut.mutate({ name: form.name, code: form.code })
    }
  }

  const doctorCountForPoli = (poliId) => doctors.filter(d => d.poliId === poliId).length

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
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Hak Akses</span><span className="text-sm font-bold text-primary">Master Administrator</span></div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00a874] ring-4 ring-[#6ffbbe]/40" />
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
            <span className="text-sm font-bold text-primary">Master Data Poliklinik</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff]/40 text-[#005c70] text-xs font-bold">Total: {polis.length} Poli</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right leading-none"><span className="text-sm font-bold text-primary">{user?.username || 'Admin'}</span><br/><span className="text-xs text-[#44474f]">Administrator</span></div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{(user?.username || 'A').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <main className="admin-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary">Manajemen Master Poliklinik</h1>
              <p className="text-sm text-[#44474f]">Kelola unit layanan poli, kode antrean, dan penugasan dokter per poli.</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary hover:bg-[#0d2b56] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"><span className="material-symbols-outlined text-[20px]">add</span>Tambah Poli</button>
          </div>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#c4c6d0]/30 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari nama poliklinik atau kode antrean..." />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm h-36 animate-pulse" />)
            ) : filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0d2b56] text-white flex items-center justify-center font-bold text-sm">{p.code}</div>
                    <div>
                      <h3 className="font-headline text-base font-bold text-primary">{p.name}</h3>
                      <p className="text-xs text-[#44474f] mt-0.5">Kode antrean: {p.code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6ffbbe]/30 text-[#005236]">Aktif</span>
                </div>
                <div className="px-5 pb-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-[#44474f]"><span className="material-symbols-outlined text-[16px] text-secondary">stethoscope</span>{doctorCountForPoli(p.id)} Dokter</span>
                </div>
                <div className="px-4 py-3 bg-[#eff4ff]/40 border-t border-[#c4c6d0]/20 flex items-center justify-end gap-1.5">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white text-[#44474f]" title="Edit Poli"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => { if (window.confirm(`Hapus poli ${p.name}?`)) deleteMut.mutate(p.id) }} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus Poli"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            ))}
            {!isLoading && filtered.length === 0 && <div className="col-span-full bg-white rounded-xl p-8 text-center text-sm text-[#747780]">Tidak ada poli cocok pencarian.</div>}
          </section>

          {/* Doctors list */}
          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#c4c6d0]/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-primary">Daftar Dokter per Poliklinik</h2>
                <p className="text-xs text-[#44474f]">Data dokter dari sistem. Kelola di halaman Manajemen Pengguna.</p>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780] text-[18px]">search</span>
                <input value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} className="pl-9 pr-3 py-2 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari dokter / poli..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3 px-5">Username Dokter</th>
                    <th className="py-3 px-5">Poliklinik Tugas</th>
                    <th className="py-3 px-5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {filteredDoctors.map(d => (
                    <tr key={d.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-3.5 px-5 font-semibold text-primary">{d.username}</td>
                      <td className="py-3.5 px-5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-primary text-xs font-semibold">{d.poli?.name || '—'}</span></td>
                      <td className="py-3.5 px-5"><span className="px-2 py-0.5 rounded-full bg-[#b3ebff]/50 text-[#004e5f] text-xs font-bold">DOCTOR</span></td>
                    </tr>
                  ))}
                  {filteredDoctors.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-sm text-[#747780]">Tidak ada dokter terdaftar. Tambahkan di Manajemen Pengguna.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b>{filteredDoctors.length}</b> dokter terdaftar</span>
              <NavLink to="/admin/users" className="text-secondary hover:underline font-bold">Kelola di Manajemen Pengguna →</NavLink>
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">{editing ? 'edit' : 'add'}</span><h3 className="font-headline font-bold text-lg">{editing ? `Edit Poliklinik — ${editing.name}` : 'Tambah Poliklinik Baru'}</h3></div>
              <button onClick={closeModal} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Nama Poliklinik</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. Poli Umum" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Kode Antrean (1-2 huruf)</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={2} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none" placeholder="A / B" required />
                <p className="text-[11px] text-[#747780] mt-1">Prefix nomor antrean (mis. A-0001)</p>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56] disabled:opacity-50">
                  {editing ? 'Simpan Perubahan' : 'Tambah Poli'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
