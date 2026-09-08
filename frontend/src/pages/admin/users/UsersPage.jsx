import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './UsersPage.css'

const initialUsers = [
  { id: 1, username: 'admin', name: 'Super Administrator', role: 'ADMIN', poli: '—', status: 'Aktif' },
  { id: 2, username: 'dokter1', name: 'dr. Danang Wicaksono, Sp.PD', role: 'DOCTOR', poli: 'Poli Umum', status: 'Aktif' },
  { id: 3, username: 'petugas1', name: 'Anita Rahmawati', role: 'REGISTRATION_OFFICER', poli: 'Poli Umum', status: 'Aktif' },
]

function roleBadge(role) {
  if (role === 'ADMIN') return 'bg-[#0d2b56] text-white'
  if (role === 'DOCTOR') return 'bg-[#b3ebff]/50 text-[#004e5f]'
  return 'bg-[#6ffbbe]/30 text-[#005236]'
}

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'REGISTRATION_OFFICER', poli: 'Poli Umum', status: 'Aktif' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const filtered = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setEditing(null); setForm({ username: '', name: '', password: '', role: 'REGISTRATION_OFFICER', poli: 'Poli Umum', status: 'Aktif' }); setShowModal(true) }
  const openEdit = (u) => { setEditing(u); setForm({ username: u.username, name: u.name, password: '', role: u.role, poli: u.poli === '—' ? 'Poli Umum' : u.poli, status: u.status }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.username || !form.name) return showToast('Username dan Nama wajib diisi!')
    if (!editing && !form.password) return showToast('Password wajib diisi untuk pengguna baru!')
    if (editing) {
      setUsers(prev => prev.map(x => x.id === editing.id ? { ...x, username: form.username, name: form.name, role: form.role, poli: form.role === 'ADMIN' ? '—' : form.poli, status: form.status } : x))
      showToast(`Pengguna ${form.name} diperbarui!`)
    } else {
      setUsers(prev => [{ id: Date.now(), username: form.username, name: form.name, role: form.role, poli: form.role === 'ADMIN' ? '—' : form.poli, status: form.status }, ...prev])
      showToast(`Pengguna ${form.name} dibuat!`)
    }
    closeModal()
  }

  const handleDelete = (u) => {
    setUsers(prev => prev.filter(x => x.id !== u.id))
    showToast(`Pengguna ${u.username} dihapus!`)
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
            <NavLink to="/login" className="admin-nav-link admin-nav-link--danger mt-4"><span className="material-symbols-outlined text-[20px]">logout</span>Keluar Sistem</NavLink>
          </nav>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">Manajemen Pengguna Sistem</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff]/40 text-[#005c70] text-xs font-bold">Total: {users.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#44474f]"><span className="material-symbols-outlined text-[16px] text-secondary">verified</span><span>SATUSEHAT ID: 3273-SYS-ADMIN</span></div>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">SA</div>
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
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari username, nama, atau role..." />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3.5 px-5">Username</th>
                    <th className="py-3.5 px-5">Nama Lengkap</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Poli Tugas</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-4 px-5"><span className="font-mono text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{u.username}</span></td>
                      <td className="py-4 px-5 font-semibold text-primary">{u.name}</td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${roleBadge(u.role)}`}>{u.role === 'REGISTRATION_OFFICER' ? 'PETUGAS' : u.role}</span></td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.poli === '—' ? 'text-[#747780]' : 'bg-[#eff4ff] text-primary'}`}>{u.poli}</span></td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${u.status === 'Aktif' ? 'bg-[#6ffbbe]/30 text-[#005236]' : 'bg-[#dce9ff] text-[#44474f]'}`}>{u.status}</span></td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#44474f]" title="Edit"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-sm text-[#747780]">Tidak ada pengguna cocok pencarian.</td></tr>}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Username (unik)</label>
                  <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. dokter1" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Nama Lengkap</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none" placeholder="cth. dr. Andi" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Password {editing && <span className="text-[#747780] font-normal">(kosongkan jika tidak ganti)</span>}</label>
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
                  <select value={form.poli} onChange={e => setForm({ ...form, poli: e.target.value })} disabled={form.role === 'ADMIN'} className={`w-full border rounded-xl px-3 py-2 text-sm ${form.role === 'ADMIN' ? 'bg-[#e5eeff]/50 border-[#c4c6d0]/30 text-[#747780]' : 'bg-[#eff4ff] border-[#c4c6d0]/60'}`}>
                    <option>Poli Umum</option>
                    <option>Poli Gigi & Mulut</option>
                    <option>Poli Anak</option>
                    <option>Poli KIA</option>
                  </select>
                  {form.role === 'ADMIN' && <p className="text-[11px] text-[#747780] mt-1">Admin tidak terikat poli</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option>Aktif</option><option>Nonaktif</option></select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56]">{editing ? 'Simpan Perubahan' : 'Buat Pengguna'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
