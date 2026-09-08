import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './DoctorExaminationPage.css'

const initialTindakan = [
  { id: 1, name: 'Pemeriksaan Uji Torniquet (Rumple Leed Test)', category: 'Diagnostik Fisik', notes: 'Hasil uji negatif (< 10 petekie / inci persegi)' },
  { id: 2, name: 'Pemberian Oralit Cairan Rehidrasi 200ml', category: 'Terapi Oral & Rehidrasi', notes: 'Diminum langsung di ruang observasi, tidak ada muntah' },
]

const initialResep = [
  { id: 1, medicine: 'Paracetamol 500mg Tablet', dosage: '3 x 1 tablet sesudah makan', qty: '10 Tablet', instruction: 'Bila demam > 38°C (prn demam)' },
  { id: 2, medicine: 'Oralit Sachet (Rehidrasi Glukosa Elektrolit)', dosage: '1 sachet dilarutkan dalam 200ml air', qty: '6 Sachet', instruction: 'Minum saat haus atau lemas' },
]

const kategoriOptions = ['Diagnostik Fisik', 'Tindakan Bedah Minor', 'Injeksi / Infus', 'Terapi Oral & Rehidrasi', 'Perawatan Luka']

export default function DoctorExaminationPage() {
  const [subjective, setSubjective] = useState('Demam naik turun sejak 3 hari yang lalu, disertai pusing berdenyut, rasa mual, dan pegal pada persendian kedua ekstremitas bawah. Belum ada mimisan ataupun bintik merah.')
  const [objective, setObjective] = useState('Keadaan Umum: Tampak sakit sedang, Compos Mentis. Kepala/Leher: Mata anemis (-/-), sklera ikterik (-/-), faring hiperemis (-). Thorax: Cor S1-S2 murni reguler, Pulmo vesikuler (+/+), rhonki (-/-). Abdomen: Supel, nyeri tekan epigastrium (+), hepar/lien tidak teraba membesar. Ekstremitas: Akral hangat, CRT < 2 detik, petekie (-).')
  const [assessment, setAssessment] = useState('A90 • Dengue Fever (Demam Dengue)')
  const [plan, setPlan] = useState('1. Rehidrasi oral adekuat 2-3 liter/hari (air putih, jus buah, larutan oralit).\n2. Pantau tanda bahaya: perdarahan gusi, mimisan, nyeri perut mendadak, atau lemas ekstrem.\n3. Kontrol ulang DL seri (Darah Lengkap & Trombosit) 24 jam kemudian jika demam belum mereda.')
  const [tindakan, setTindakan] = useState(initialTindakan)
  const [resep, setResep] = useState(initialResep)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  const addTindakan = () => setTindakan(prev => [...prev, { id: Date.now(), name: '', category: 'Diagnostik Fisik', notes: '' }])
  const removeTindakan = (id) => setTindakan(prev => prev.filter(r => r.id !== id))
  const updateTindakan = (id, field, val) => setTindakan(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const addResep = () => setResep(prev => [...prev, { id: Date.now(), medicine: '', dosage: '', qty: '', instruction: '' }])
  const removeResep = (id) => setResep(prev => prev.filter(r => r.id !== id))
  const updateResep = (id, field, val) => setResep(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const handleCopyRM = async () => {
    try { await navigator.clipboard.writeText('RM-0001'); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  const handleSave = (e) => {
    e.preventDefault()
    showToast('Pemeriksaan SOAP dan Resep berhasil disimpan!')
  }

  return (
    <div className="doctor-page">
      {toast && <div className="doctor-toast"><span className="material-symbols-outlined text-[#50d9fe]">verified</span>{toast}</div>}

      <aside className="doctor-sidebar">
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center gap-3 bg-white border-b border-[#c4c6d0]/20">
            <img alt="Medvita" className="h-8 w-auto object-contain" src="/logo.png" />
            <div className="flex flex-col"><span className="font-headline text-[1.05rem] font-bold text-primary leading-none">Medvita</span><span className="text-[0.68rem] font-bold text-secondary tracking-widest uppercase">Clinical OS</span></div>
          </div>
          <div className="p-4">
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center justify-between">
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Lokasi Praktik</span><span className="text-sm font-bold text-primary">Poli Umum R.01</span></div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00a874] ring-4 ring-[#6ffbbe]/40" />
            </div>
          </div>
          <nav className="px-2 space-y-1">
            <NavLink to="/doctor/queue" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">format_list_numbered</span>Antrean Pasien</NavLink>
            <NavLink to="/doctor" end className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">clinical_notes</span>Formulir SOAP</NavLink>
            <NavLink to="/records" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">folder_shared</span>Rekam Medis</NavLink>
            <NavLink to="/login" className="doctor-nav-link doctor-nav-link--danger"><span className="material-symbols-outlined text-[1.25rem]">logout</span>Keluar</NavLink>
          </nav>
        </div>
      </aside>

      <div className="doctor-main">
        <header className="doctor-topbar">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] rounded-full"><span className="h-2 w-2 rounded-full bg-[#00a874] animate-pulse" /><span className="text-xs font-bold text-[#005236]">Sesi Terbuka</span></span>
            <span className="hidden md:inline text-sm text-[#44474f]">Modul Pemeriksaan Rawat Jalan</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1.5 bg-[#eff4ff] px-3 py-1.5 rounded-lg text-[#44474f]"><span className="material-symbols-outlined text-[1.05rem]">badge</span><span className="text-xs font-bold">SIP: 446.1/4092/Dinkes/2023</span></div>
            <div className="h-8 w-px bg-[#dce9ff] hidden md:block" />
            <div className="flex items-center gap-2.5 text-right">
              <div className="hidden sm:flex flex-col leading-none"><span className="text-sm font-bold text-primary">dr. Danang Wicaksono, Sp.PD</span><span className="text-xs text-[#44474f]">Dokter Penanggung Jawab Pelayanan</span></div>
              <div className="w-8 h-8 rounded-full bg-[#b3ebff]/50 flex items-center justify-center text-secondary ring-2 ring-[#50d9fe]/30"><span className="material-symbols-outlined text-[1.2rem]">person</span></div>
            </div>
          </div>
        </header>

        <main className="doctor-content">
          <section className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary shadow-sm ring-2 ring-[#e5eeff]"><span className="material-symbols-outlined text-[2rem]">person</span></div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a874] rounded-full ring-2 ring-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-headline text-[1.35rem] font-bold text-primary tracking-tight">Budi Pratama</h1>
                    <span className="text-xs font-semibold text-[#44474f] bg-[#eff4ff] px-2 py-0.5 rounded-full">34 Thn • Laki-laki (L)</span>
                    <button onClick={handleCopyRM} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] px-2 py-0.5 rounded-md text-primary text-xs font-bold transition-colors" type="button"><span className="material-symbols-outlined text-[0.85rem] text-secondary">content_copy</span>{copied ? 'Tersalin!' : 'RM-0001'}</button>
                    <span className="text-xs text-[#44474f] hidden md:inline">NIK: 3271021405900003</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[#005c70] bg-[#b3ebff]/40 px-2 py-0.5 rounded-full text-xs font-bold"><span className="material-symbols-outlined text-[0.85rem]">verified_user</span>BPJS Kesehatan (JKN Aktif)</span>
                    <span className="inline-flex items-center gap-1 bg-[#eff4ff] px-2 py-0.5 rounded-full text-xs font-bold text-primary"><span className="material-symbols-outlined text-[0.85rem]">stethoscope</span>Kunjungan Rawat Jalan - Poli Umum</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#eff4ff] rounded-lg p-3 flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[1rem] text-secondary">vital_signs</span><span className="text-xs uppercase tracking-wider text-[#44474f] font-bold">Tanda Vital Terakhir (Triase 08:15 WIB)</span></div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-baseline gap-1"><span className="text-xs text-[#44474f]">TD:</span><b className="text-primary text-base">120/80</b><span className="text-xs text-[#44474f]">mmHg</span></span>
                <span className="h-3 w-px bg-[#d3e4fe] hidden sm:block" />
                <span className="flex items-baseline gap-1"><span className="text-xs text-[#44474f]">Nadi:</span><b className="text-primary text-base">78</b><span className="text-xs text-[#44474f]">x/mnt</span></span>
                <span className="h-3 w-px bg-[#d3e4fe] hidden sm:block" />
                <span className="flex items-baseline gap-1"><span className="text-xs text-[#44474f]">Suhu:</span><b className="text-primary text-base">36.6</b><span className="text-xs text-[#44474f]">°C</span></span>
                <span className="h-3 w-px bg-[#d3e4fe] hidden sm:block" />
                <span className="flex items-baseline gap-1"><span className="text-xs text-[#44474f]">BB / TB:</span><b className="text-primary">68 <span className="font-normal text-xs text-[#44474f]">kg</span> / 172 <span className="font-normal text-xs text-[#44474f]">cm</span></b></span>
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-xs font-bold text-[#005236]"><span className="w-1.5 h-1.5 rounded-full bg-[#00a874]" />IMT 23.0 (Normal)</span>
              </div>
            </div>
          </section>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <section className="bg-white rounded-xl shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[1.25rem] text-primary">edit_note</span><h2 className="font-headline text-base font-bold text-primary">Catatan Perkembangan Pasien Terintegrasi</h2></div><span className="hidden sm:inline text-xs font-semibold text-[#44474f] bg-[#eff4ff] px-2.5 py-1 rounded-full">Format Standar Rekam Medis</span></div>

              <div className="soap-card">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">record_voice_over</span><label className="text-sm font-bold text-primary" htmlFor="soapS">Pemeriksaan Subjektif (Keluhan & Anamnesis)</label></div><span className="text-[0.68rem] font-medium text-[#747780]">RPS / RPD / Keluhan Utama</span></div>
                <textarea id="soapS" value={subjective} onChange={e => setSubjective(e.target.value)} rows={3} className="soap-textarea" placeholder="Tuliskan keluhan utama, riwayat perjalanan penyakit (RPS)..." />
                <div className="flex items-center gap-1 text-[0.68rem] text-[#747780]"><span className="material-symbols-outlined text-[0.85rem] text-secondary">info</span>Onset: 3 hari • Sifat: Akut • Faktor pemberat: Aktivitas fisik</div>
              </div>

              <div className="soap-card">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">stethoscope</span><label className="text-sm font-bold text-primary" htmlFor="soapO">Pemeriksaan Objektif (Pemeriksaan Fisik & Tanda Vital)</label></div><span className="text-[0.68rem] font-medium text-[#747780]">Status Generalis & Lokalis</span></div>
                <textarea id="soapO" value={objective} onChange={e => setObjective(e.target.value)} rows={3} className="soap-textarea" placeholder="Hasil inspeksi, palpasi, perkusi, auskultasi..." />
                <div className="flex items-center gap-1 text-[0.68rem] text-[#747780]"><span className="material-symbols-outlined text-[0.85rem] text-secondary">check_circle</span>Tanda vital telah sinkron otomatis dari triase perawat</div>
              </div>

              <div className="soap-card">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">assignment</span><label className="text-sm font-bold text-primary">Asesmen & Diagnosis (ICD-10)</label></div><span className="text-[0.68rem] font-medium text-[#747780]">Diagnosis Kerja Klinis</span></div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1"><input value={assessment} onChange={e => setAssessment(e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/60 rounded-lg px-3 py-2 text-sm font-semibold text-primary focus:ring-2 focus:ring-[#00677d] focus:outline-none pr-8" placeholder="Cari kode ICD-10..." /><span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[1.1rem] text-secondary">search</span></div>
                  <select className="bg-[#f8f9ff] border border-[#c4c6d0]/60 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#00677d] focus:outline-none"><option>Primer</option><option>Sekunder</option><option>Komplikasi</option></select>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5"><span className="text-[0.68rem] font-bold text-[#747780]">Diagnosis Sekunder:</span><span className="inline-flex items-center gap-1 bg-[#eff4ff] px-2 py-0.5 rounded text-xs"><span className="material-symbols-outlined text-[0.85rem] text-secondary">verified</span>R11.0 • Nausea with vomiting <button type="button" className="text-[#747780] hover:text-[#ba1a1a] ml-1">×</button></span><button type="button" className="text-xs font-bold text-secondary hover:underline inline-flex items-center gap-0.5"><span className="material-symbols-outlined text-[0.75rem]">add</span>Tambah Diagnosis</button></div>
              </div>

              <div className="soap-card">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">fact_check</span><label className="text-sm font-bold text-primary" htmlFor="soapP">Rencana Terapi, Edukasi & Rujukan (Plan)</label></div><span className="text-[0.68rem] font-medium text-[#747780]">Instruksi Klinis</span></div>
                <textarea id="soapP" value={plan} onChange={e => setPlan(e.target.value)} rows={3} className="soap-textarea" placeholder="Rencana tatalaksana, anjuran hidrasi..." />
                <div className="flex items-center justify-between text-[0.68rem] text-[#747780]"><span>Edukasi tanda bahaya telah disampaikan kepada pasien/keluarga</span><span className="font-bold text-secondary">Kontrol: 2 Hari Lagi</span></div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-[#c4c6d0]/40 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[1.2rem]">medical_services</span></div><div><h3 className="font-headline text-sm font-bold text-primary">Input Tindakan Medis</h3><p className="text-xs text-[#44474f]">Prosedur tindakan klinis pada sesi konsultasi</p></div></div>
                <button type="button" onClick={addTindakan} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><span className="material-symbols-outlined text-[1.05rem] text-secondary">add_circle</span>+ Tambah Tindakan</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="text-xs text-[#44474f] bg-[#eff4ff]/70"><tr><th className="py-2 px-3 font-semibold">Nama Tindakan / Prosedur</th><th className="py-2 px-3 font-semibold w-48">Kategori</th><th className="py-2 px-3 font-semibold">Catatan / Keterangan</th><th className="py-2 px-2 text-center w-12">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-[#eff4ff] text-sm">
                    {tindakan.map(row => (
                      <tr key={row.id} className="hover:bg-[#eff4ff]/30">
                        <td className="py-2.5 px-3"><input value={row.name} onChange={e => updateTindakan(row.id, 'name', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Nama prosedur / tindakan" /></td>
                        <td className="py-2.5 px-3"><select value={row.category} onChange={e => updateTindakan(row.id, 'category', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary">{kategoriOptions.map(o => <option key={o}>{o}</option>)}</select></td>
                        <td className="py-2.5 px-3"><input value={row.notes} onChange={e => updateTindakan(row.id, 'notes', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Keterangan pelaksanaan..." /></td>
                        <td className="py-2.5 px-2 text-center"><button type="button" onClick={() => removeTindakan(row.id)} className="p-1.5 rounded-lg text-[#747780] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40"><span className="material-symbols-outlined text-[1.1rem]">delete</span></button></td>
                      </tr>
                    ))}
                    {tindakan.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-sm text-[#747780]">Belum ada tindakan. Klik + Tambah Tindakan.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-[#c4c6d0]/40 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[1.2rem]">prescriptions</span></div><div><div className="flex items-center gap-2"><h3 className="font-headline text-sm font-bold text-primary">Input Resep Obat (E-Prescription)</h3></div><p className="text-xs text-[#44474f]">Sistem otomatis memvalidasi kontraindikasi alergi pasien</p></div></div>
                <button type="button" onClick={addResep} className="inline-flex items-center gap-1 bg-primary hover:bg-[#0d2b56] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><span className="material-symbols-outlined text-[1.05rem]">add_circle</span>+ Tambah Obat</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead className="text-xs text-[#44474f] bg-[#eff4ff]/70"><tr><th className="py-2 px-3 font-semibold">Nama Obat & Bentuk Sediaan</th><th className="py-2 px-3 font-semibold w-52">Dosis / Aturan Pakai</th><th className="py-2 px-3 font-semibold w-32">Jumlah</th><th className="py-2 px-3 font-semibold">Catatan / Instruksi</th><th className="py-2 px-2 text-center w-12">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-[#eff4ff] text-sm">
                    {resep.map(row => (
                      <tr key={row.id} className="hover:bg-[#eff4ff]/30">
                        <td className="py-2.5 px-3"><input value={row.medicine} onChange={e => updateResep(row.id, 'medicine', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Ketik nama obat..." /></td>
                        <td className="py-2.5 px-3"><input value={row.dosage} onChange={e => updateResep(row.id, 'dosage', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Aturan pakai..." /></td>
                        <td className="py-2.5 px-3"><input value={row.qty} onChange={e => updateResep(row.id, 'qty', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Jumlah..." /></td>
                        <td className="py-2.5 px-3"><input value={row.instruction} onChange={e => updateResep(row.id, 'instruction', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Catatan tambahan..." /></td>
                        <td className="py-2.5 px-2 text-center"><button type="button" onClick={() => removeResep(row.id)} className="p-1.5 rounded-lg text-[#747780] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40"><span className="material-symbols-outlined text-[1.1rem]">delete</span></button></td>
                      </tr>
                    ))}
                    {resep.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-[#747780]">Belum ada resep. Klik + Tambah Obat.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#c4c6d0]/40 shadow-md flex flex-wrap items-center justify-between gap-3 z-10">
              <div className="flex items-center gap-2 text-xs text-[#44474f]"><span className="w-2 h-2 rounded-full bg-[#00a874] animate-pulse" />Tersimpan otomatis 1 menit lalu<span className="h-3 w-px bg-[#d3e4fe] hidden sm:block" /><button type="button" onClick={() => showToast('Membuka pratinjau resume medis...')} className="text-secondary hover:underline inline-flex items-center gap-1 font-bold"><span className="material-symbols-outlined text-[1rem]">print</span>Cetak Resume Medis</button></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => showToast('Draft formulir SOAP berhasil disimpan!')} className="inline-flex items-center gap-1 text-primary hover:bg-[#eff4ff] px-4 py-2 rounded-lg text-xs font-bold"><span className="material-symbols-outlined text-[1.05rem]">save</span>Simpan sebagai Draft</button>
                <button type="submit" className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#0d2b56] text-white px-5 py-2 rounded-lg text-xs font-bold shadow"><span className="material-symbols-outlined text-[1.05rem] text-[#b3ebff]">verified</span>Simpan Pemeriksaan</button>
                <button type="button" onClick={() => showToast('Pemeriksaan selesai & resep diteruskan ke Farmasi!')} className="inline-flex items-center gap-1.5 bg-secondary hover:opacity-90 text-white px-4 py-2 rounded-lg text-xs font-bold shadow"><span className="material-symbols-outlined text-[1.05rem]">local_pharmacy</span>Kirim ke Farmasi</button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
