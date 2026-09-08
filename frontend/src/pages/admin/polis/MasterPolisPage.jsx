import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './MasterPolisPage.css'

const initialPolis = [
  { id: 1, name: 'Poli Umum', code: 'A', desc: 'Layanan medis umum & rawat jalan terpadu', queues: 28, status: 'Aktif' },
  { id: 2, name: 'Poli Gigi & Mulut', code: 'B', desc: 'Pemeriksaan, perawatan, dan bedah gigi', queues: 12, status: 'Aktif' },
  { id: 3, name: 'Poli Anak', code: 'C', desc: 'Layanan pediatri & imunisasi anak', queues: 18, status: 'Aktif' },
  { id: 4, name: 'Poli KIA', code: 'D', desc: 'Kesehatan Ibu dan Anak terintegrasi', queues: 8, status: 'Aktif' },
]

const initialDoctors = [
  { id: 1, name: 'dr. Danang Wicaksono, Sp.PD', poli: 'Poli Umum', sip: '446.1/4382/SIP-D/2022', phone: '0812-8901-2201', status: 'Aktif' },
  { id: 2, name: 'dr. Budi Santoso', poli: 'Poli Umum', sip: '446.1/4383/SIP-D/2022', phone: '0812-8901-2202', status: 'Aktif' },
  { id: 3, name: 'drg. Siti Lestari', poli: 'Poli Gigi & Mulut', sip: '446.1/4384/SIP-D/2022', phone: '0812-8901-2203', status: 'Aktif' },
  { id: 4, name: 'dr. Rina Amelia, Sp.A', poli: 'Poli Anak', sip: '446.1/4385/SIP-D/2022', phone: '0812-8901-2204', status: 'Aktif' },
  { id: 5, name: 'dr. Siska Pratama', poli: 'Poli KIA', sip: '446.1/4386/SIP-D/2022', phone: '0812-8901-2205', status: 'Aktif' },
]

export default function MasterPolisPage() {
  const [polis, setPolis] = useState(initialPolis)
  const [doctors, setDoctors] = useState(initialDoctors)
  const [search, setSearch] = useState('')
  const [doctorSearch, setDoctorSearch] = useState('')
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', desc: '', status: 'Aktif' })
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [doctorForm, setDoctorForm] = useState({ name: '', poli: 'Poli Umum', sip: '', phone: '', status: 'Aktif' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const filtered = polis.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  const filteredDoctors = doctors.filter(d => !doctorSearch || d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || d.poli.toLowerCase().includes(doctorSearch.toLowerCase()) || d.sip.includes(doctorSearch))

  const doctorCount = (poliName) => doctors.filter(d => d.poli === poliName).length

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', desc: '', status: 'Aktif' }); setShowModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, code: p.code, desc: p.desc, status: p.status }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.name || !form.code) return showToast('Nama dan Kode poli wajib diisi!')
    if (editing) {
      setPolis(prev => prev.map(x => x.id === editing.id ? { ...x, ...form } : x))
      showToast(`Poliklinik ${form.name} diperbarui!`)
    } else {
      const newPoli = { id: Date.now(), ...form, queues: 0 }
      setPolis(prev => [newPoli, ...prev])
      showToast(`Poliklinik ${form.name} ditambahkan!`)
    }
    closeModal()
  }

  const handleDelete = (p) => {
    setPolis(prev => prev.filter(x => x.id !== p.id))
    showToast(`Poliklinik ${p.name} dihapus!`)
  }

  const openDoctorCreate = () => { setEditingDoctor(null); setDoctorForm({ name: '', poli: polis[0]?.name || 'Poli Umum', sip: '', phone: '', status: 'Aktif' }); setShowDoctorModal(true) }
  const openDoctorEdit = (d) => { setEditingDoctor(d); setDoctorForm({ name: d.name, poli: d.poli, sip: d.sip, phone: d.phone, status: d.status }); setShowDoctorModal(true) }
  const closeDoctorModal = () => { setShowDoctorModal(false); setEditingDoctor(null) }

  const handleDoctorSave = (e) => {
    e.preventDefault()
    if (!doctorForm.name || !doctorForm.poli) return showToast('Nama dokter dan Poli wajib diisi!')
    if (editingDoctor) {
      setDoctors(prev => prev.map(x => x.id === editingDoctor.id ? { ...x, ...doctorForm } : x))
      showToast(`Dokter ${doctorForm.name} diperbarui!`)
    } else {
      const newDoc = { id: Date.now(), ...doctorForm }
      setDoctors(prev => [newDoc, ...prev])
      showToast(`Dokter ${doctorForm.name} ditambahkan ke ${doctorForm.poli}!`)
    }
    closeDoctorModal()
  }

  const handleDoctorDelete = (d) => {
    setDoctors(prev => prev.filter(x => x.id !== d.id))
    showToast(`Dokter ${d.name} dihapus!`)
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
            <span className="text-sm font-bold text-primary">Master Data Poliklinik</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff]/40 text-[#005c70] text-xs font-bold">Total: {polis.length} Poli</span>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary">Manajemen Master Poliklinik</h1>
              <p className="text-sm text-[#44474f]">Pusat pengelolaan unit layanan poli, kode antrean, dan penugasan dokter per poli.</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary hover:bg-[#0d2b56] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md"><span className="material-symbols-outlined text-[20px]">add</span>Tambah Poli</button>
          </div>

          <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#c4c6d0]/30 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari nama poliklinik atau kode antrean..." />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2.5 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold border border-[#c4c6d0]/40 flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">filter_list</span>Filter Status</button>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0d2b56] text-white flex items-center justify-center font-bold text-sm">{p.code}</div>
                    <div>
                      <h3 className="font-headline text-base font-bold text-primary">{p.name}</h3>
                      <p className="text-xs text-[#44474f] mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'Aktif' ? 'bg-[#6ffbbe]/30 text-[#005236]' : 'bg-[#dce9ff] text-[#44474f]'}`}>{p.status}</span>
                </div>
                <div className="px-5 pb-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-[#44474f]"><span className="material-symbols-outlined text-[16px] text-secondary">stethoscope</span>{doctorCount(p.name)} Dokter</span>
                  <span className="flex items-center gap-1 text-[#44474f]"><span className="material-symbols-outlined text-[16px] text-secondary">confirmation_number</span>{p.queues} Antrean</span>
                </div>
                <div className="px-4 py-3 bg-[#eff4ff]/40 border-t border-[#c4c6d0]/20 flex items-center justify-end gap-1.5">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white text-[#44474f]" title="Edit Poli"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus Poli"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full bg-white rounded-xl p-8 text-center text-sm text-[#747780]">Tidak ada poli cocok pencarian.</div>}
          </section>

          <section className="bg-white rounded-2xl border border-[#c4c6d0]/30 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#c4c6d0]/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-primary">Data Dokter per Poliklinik</h2>
                <p className="text-xs text-[#44474f]">Master data admin untuk menambah, mengedit, dan menghapus data dokter yang ditugaskan per poli.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780] text-[18px]">search</span>
                  <input value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)} className="pl-9 pr-3 py-2 rounded-xl bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari dokter / poli / SIP..." />
                </div>
                <button onClick={openDoctorCreate} className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#0d2b56] text-white px-3 py-2 rounded-xl font-bold text-xs shadow-md"><span className="material-symbols-outlined text-[18px]">person_add</span>Tambah Dokter</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff]/60 text-[#44474f] text-xs uppercase tracking-wider font-semibold border-b border-[#c4c6d0]/20">
                    <th className="py-3 px-5">Nama Dokter</th>
                    <th className="py-3 px-5">Poliklinik</th>
                    <th className="py-3 px-5">SIP / Str</th>
                    <th className="py-3 px-5">No. Telepon</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c6d0]/20 text-[#0b1c30]">
                  {filteredDoctors.map(d => (
                    <tr key={d.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-3.5 px-5 font-semibold text-primary">{d.name}</td>
                      <td className="py-3.5 px-5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-primary text-xs font-semibold">{d.poli}</span></td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#44474f]">{d.sip || '—'}</td>
                      <td className="py-3.5 px-5 font-mono text-xs text-[#44474f]">{d.phone || '—'}</td>
                      <td className="py-3.5 px-5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${d.status === 'Aktif' ? 'bg-[#6ffbbe]/30 text-[#005236]' : 'bg-[#dce9ff] text-[#44474f]'}`}>{d.status}</span></td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openDoctorEdit(d)} className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#44474f]" title="Edit Dokter"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                          <button onClick={() => handleDoctorDelete(d)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a]" title="Hapus Dokter"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDoctors.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-sm text-[#747780]">Tidak ada dokter cocok pencarian.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#eff4ff]/30 border-t border-[#c4c6d0]/20 flex items-center justify-between text-xs text-[#44474f]">
              <span>Menampilkan <b>{filteredDoctors.length}</b> dari <b>{doctors.length}</b> dokter terdaftar</span>
              <span className="text-[#747780]">Assign via Master Admin</span>
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
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. Poli Umum, Poli Gigi" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Kode Antrean</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={2} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm font-bold text-center focus:outline-none" placeholder="A / B / C" required />
                  <p className="text-[11px] text-[#747780] mt-1">Prefix nomor antrean (mis. A001)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option>Aktif</option><option>Nonaktif</option></select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Deskripsi Layanan</label>
                <textarea rows={2} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm resize-none" placeholder="Ringkasan layanan poli..." />
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56]">{editing ? 'Simpan Perubahan' : 'Tambah Poli'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeDoctorModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#c4c6d0]/30" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">{editingDoctor ? 'edit' : 'person_add'}</span><h3 className="font-headline font-bold text-lg">{editingDoctor ? `Edit Dokter — ${editingDoctor.name}` : 'Tambah Dokter Baru'}</h3></div>
              <button onClick={closeDoctorModal} className="text-white/80 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleDoctorSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">Nama Lengkap Dokter</label>
                <input value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="cth. dr. Danang Wicaksono, Sp.PD" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Poliklinik (tugas)</label>
                  <select value={doctorForm.poli} onChange={e => setDoctorForm({ ...doctorForm, poli: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm">
                    {polis.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">Status</label>
                  <select value={doctorForm.status} onChange={e => setDoctorForm({ ...doctorForm, status: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm"><option>Aktif</option><option>Nonaktif</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">SIP / Str (opsional)</label>
                  <input value={doctorForm.sip} onChange={e => setDoctorForm({ ...doctorForm, sip: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" placeholder="446.1/4382/SIP-D/2022" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">No. Telepon</label>
                  <input value={doctorForm.phone} onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })} className="w-full bg-[#eff4ff] border border-[#c4c6d0]/60 rounded-xl px-3 py-2 text-sm" placeholder="0812..." />
                </div>
              </div>
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#c4c6d0]/20">
                <button type="button" onClick={closeDoctorModal} className="px-4 py-2 rounded-xl bg-[#eff4ff] text-primary text-sm font-semibold hover:bg-[#dce9ff]">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-[#0d2b56]">{editingDoctor ? 'Simpan Perubahan' : 'Tambah Dokter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
