import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/user'
import { getPolis } from '../../../services/poli'
import './UsersPage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function roleBadge(role) {
  if (role === 'ADMIN') return 'bg-[#0d2b56] text-white'
  if (role === 'DOCTOR') return 'bg-[#b3ebff]/50 text-[#004e5f]'
  return 'bg-[#6ffbbe]/30 text-[#005236]'
}

export default function UsersPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const user = getUser()

  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: 'REGISTRATION_OFFICER', poliId: '' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await getUsers()
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  const { data: polisData } = useQuery({
    queryKey: ['polis-users'],
    queryFn: async () => {
      const res = await getPolis()
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  const users = Array.isArray(usersData) ? usersData : []
  const polis = Array.isArray(polisData) ? polisData : []

  const filtered = users.filter(u => !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  const createMut = useMutation({
    mutationFn: (data) => createUser(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); showToast('Pengguna berhasil dibuat!'); closeModal() },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal membuat pengguna'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); showToast('Pengguna berhasil diperbarui!'); closeModal() },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal update pengguna'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); showToast('Pengguna berhasil dihapus!') },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal hapus pengguna'),
  })

  const openCreate = () => { setEditing(null); setForm({ username: '', password: '', role: 'REGISTRATION_OFFICER', poliId: '' }); setShowModal(true) }
  const openEdit = (u) => { setEditing(u); setForm({ username: u.username, password: '', role: u.role, poliId: u.poliId || '' }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.username) return showToast('Username wajib diisi!')
    if (!editing && !form.password) return showToast('Password wajib diisi untuk pengguna baru!')

    const payload = {
      username: form.username,
      role: form.role,
      poliId: form.role === 'DOCTOR' && form.poliId ? Number(form.poliId) : null,
    }
    if (form.password) payload.password = form.password

    if (editing) {
      updateMut.mutate({ id: editing.id, data: payload })
    } else {
      createMut.mutate(payload)
    }
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
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">Manajemen Pengguna Sistem</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff]/40 text-[#005c70] text-xs font-bold">Total: {users.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">{(user?.username || 'A').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <main className="admin-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary">Manajemen Pengguna & Hak Akses</h1>
              <p className="text-sm text-[#44474f]">Kelola akun ADMIN, DOCTOR, dan REGISTRATION_OFFICER. Penugasan poli hanya untuk DOCTOR.</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary hover:bg-[#0d2b56] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"><span className="material-symbols-outlined text-[20px]">person_add</span>Tambah Pengguna</button>
          </div>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#c4c6d0]/30">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari username atau role..." />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3.5 px-5">Username</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Poli Tugas</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-10 text-center text-sm text-[#44474f]">Memuat data pengguna...</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-4 px-5"><span className="font-mono text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{u.username}</span></td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadge(u.role)}`}>{u.role === 'REGISTRATION_OFFICER' ? 'PETUGAS' : u.role}</span></td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${!u.poli ? 'text-[#747780]' : 'bg-[#eff4ff] text-primary'}`}>{u.poli?.name || '—'}</span></td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#44474f]" title="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => { if (window.confirm(`Hapus pengguna ${u.username}?`)) deleteMut.mutate(u.id) }} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-sm text-[#747780]">Tidak ada pengguna cocok pencarian.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b>{filtered.length}</b> dari <b>{users.length}</b> pengguna terdaftar</span>
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">{editing ? 'edit' : 'person_add'}</span><h3 className="font-headline font-bold text-lg">{editing ? `Edit Pengguna — ${editing.username}` : 'Tambah Pengguna Baru'}</h3></div>
              <button onClick={closeModal} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Username (unik) <span className="text-red-400">*</span></label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. dokter1" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Password {editing && <span className="text-[#747780] font-normal">(kosongkan jika tidak ganti)</span>}
                  {!editing && <span className="text-red-400"> *</span>}
                </label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="••••••••" required={!editing} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm">
                    <option value="ADMIN">ADMIN</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="REGISTRATION_OFFICER">REGISTRATION_OFFICER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Poliklinik Tugas</label>
                  <select value={form.poliId} onChange={e => setForm({ ...form, poliId: e.target.value })} disabled={form.role !== 'DOCTOR'} className={`w-full border rounded-xl px-3 py-2 text-sm ${form.role !== 'DOCTOR' ? 'bg-[#e5eeff]/50 border-[#c4c6d0]/30 text-[#747780]' : 'bg-[#eff4ff] border-[#c4c6d0]/60'}`}>
                    <option value="">— Tidak ada —</option>
                    {polis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {form.role !== 'DOCTOR' && <p className="text-[11px] text-[#747780] mt-1">Hanya DOCTOR yang terikat poli</p>}
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56] disabled:opacity-50">
                  {editing ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
