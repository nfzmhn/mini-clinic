import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './MasterPatientsPage.css'

const initialPatients = [
  { id: 1, mrn: 'RM-0001', nik: '3271021405900003', name: 'Budi Pratama', gender: 'L', age: 34, phone: '081289214320', address: 'Jl. Dipati Ukur No. 45, Bandung', status: 'Aktif JKN' },
  { id: 2, mrn: 'RM-0002', nik: '3171054902950002', name: 'Dewi Wulandari', gender: 'P', age: 29, phone: '085711209944', address: 'Komp. Antapani Mas B-12, Bandung', status: 'Umum' },
  { id: 3, mrn: 'RM-0003', nik: '3273010403560001', name: 'H. Nurdin Iskandar', gender: 'L', age: 68, phone: '081322897711', address: 'Jl. Buah Batu No. 110A, Bandung', status: 'Aktif JKN' },
  { id: 4, mrn: 'RM-0004', nik: '3273123456000004', name: 'Siti Aminah', gender: 'P', age: 44, phone: '082144556677', address: 'Griya Cempaka Arum Blok B4', status: 'Asuransi' },
  { id: 5, mrn: 'RM-0005', nik: '3273051112880009', name: 'Fauzan Kamil', gender: 'L', age: 36, phone: '087822119900', address: 'Jl. Setiabudi No. 193, Bandung', status: 'Aktif JKN' },
]

export default function MasterPatientsPage() {
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', nik: '', gender: 'L', age: 0, phone: '', address: '', status: 'Aktif JKN' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const filtered = patients.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.nik.includes(search) || p.mrn.toLowerCase().includes(search.toLowerCase()))

  const openEdit = (p) => {
    setEditing(p)
    setEditForm({ name: p.name, nik: p.nik, gender: p.gender, age: p.age, phone: p.phone, address: p.address, status: p.status })
  }

  const closeEdit = () => setEditing(null)

  const saveEdit = (e) => {
    e.preventDefault()
    if (!editForm.nik || !editForm.name) return showToast('NIK dan Nama wajib diisi!')
    setPatients(prev => prev.map(x => x.id === editing.id ? { ...x, ...editForm } : x))
    showToast(`Data pasien ${editForm.name} berhasil diperbarui!`)
    closeEdit()
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
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#44474f]"><span className="material-symbols-outlined text-[16px] text-secondary">verified</span><span>SATUSEHAT ID: 3273-SYS-ADMIN</span></div>
            <div className="flex items-center gap-2">
              <div className="text-right leading-none"><span className="text-sm font-bold text-primary">Super Administrator</span><br/><span className="text-xs text-[#44474f]">IT & Clinic System</span></div>
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">SA</div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="flex flex-col gap-1">
            <h1 className="font-headline text-2xl font-bold text-primary">Manajemen Master Data Pasien</h1>
            <p className="text-sm text-[#44474f]">Pusat pengelolaan rekam identitas, NIK validasi Dukcapil, serta integrasi jaminan kesehatan nasional.</p>
          </div>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#c4c6d0]/30 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari nama lengkap pasien, NIK 16 digit, atau nomor rekam medis..." />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="px-4 py-2.5 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold border border-[#c4c6d0]/40 flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">filter_list</span>Filter Status</button>
              <button className="px-4 py-2.5 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold border border-[#c4c6d0]/40 flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">file_download</span>Ekspor Data</button>
            </div>
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
                    <th className="py-3.5 px-5">Status Jaminan</th>
                    <th className="py-3.5 px-5 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                      <td className="py-4 px-5"><span className="text-sm font-bold text-primary bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#c4c6d0]/40">{p.mrn}</span></td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col"><span className="font-semibold text-primary">{p.name}</span><span className="text-xs text-[#747780]">NIK: {p.nik}</span></div>
                      </td>
                      <td className="py-4 px-5"><span className="text-sm font-medium">{p.gender === 'L' ? 'Laki-laki' : 'Perempuan'} ({p.age} Thn)</span></td>
                      <td className="py-4 px-5 font-mono text-xs text-[#44474f]">{p.phone}</td>
                      <td className="py-4 px-5 text-xs text-[#44474f] max-w-xs truncate">{p.address}</td>
                      <td className="py-4 px-5"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'Aktif JKN' ? 'bg-[#6ffbbe]/30 text-[#005236]' : p.status === 'Asuransi' ? 'bg-[#b3ebff]/50 text-[#004e5f]' : 'bg-[#dce9ff] text-[#44474f]'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{p.status}</span></td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => showToast(`Membuka profil rekam medis ${p.mrn}...`)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-secondary" title="Lihat Rekam Medis"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#44474f]" title="Edit Pasien"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => { setPatients(prev => prev.filter(x => x.id !== p.id)); showToast(`Pasien ${p.mrn} dihapus dari master!`) }} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b>{filtered.length}</b> dari <b>{patients.length}</b> data master pasien terdaftar</span>
              <div className="flex items-center gap-1"><span className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold">1</span><button className="px-3 py-1.5 rounded-lg border border-[#c4c6d0]/40 hover:bg-[#dce9ff]">2</button></div>
            </div>
          </section>
        </main>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeEdit}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">edit</span><h3 className="font-headline font-bold text-lg">Edit Master Pasien — {editing.mrn}</h3></div>
              <button onClick={closeEdit} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">NIK 16 Digit</label>
                  <input value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} maxLength={16} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="327102..." required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Nama Lengkap</label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. Budi Pratama" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Gender</label>
                  <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option value="L">Laki-laki (L)</option><option value="P">Perempuan (P)</option></select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Usia</label>
                  <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: Number(e.target.value) })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">No. Telepon</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" placeholder="0812..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Alamat Domisili</label>
                <textarea rows={2} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm resize-none" placeholder="Jalan, RT/RW, Kecamatan..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Status Jaminan</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option>Aktif JKN</option><option>Asuransi</option><option>Umum</option></select>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeEdit} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56]">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
