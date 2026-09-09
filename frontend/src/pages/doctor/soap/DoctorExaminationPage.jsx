import { useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { createMedicalRecord, getRecordByRegistration } from '../../../services/medicalRecord'
import api from '../../../services/api'
import './DoctorExaminationPage.css'

const kategoriOptions = ['Diagnostik Fisik', 'Tindakan Bedah Minor', 'Injeksi / Infus', 'Terapi Oral & Rehidrasi', 'Perawatan Luka']

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

export default function DoctorExaminationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const registrationId = searchParams.get('registrationId')
  const user = getUser()

  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [bp, setBp] = useState('')
  const [temp, setTemp] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [tindakan, setTindakan] = useState([])
  const [resep, setResep] = useState([])
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600) }

  // Load registration data
  const { data: regData, isLoading: regLoading } = useQuery({
    queryKey: ['registration-soap', registrationId],
    queryFn: async () => {
      if (!registrationId) return null
      const { data } = await api.get(`/registrations/${registrationId}`)
      return data?.data || data
    },
    enabled: !!registrationId,
  })

  // Check if record already exists
  const { data: existingRecord } = useQuery({
    queryKey: ['existing-record', registrationId],
    queryFn: () => getRecordByRegistration(registrationId),
    enabled: !!registrationId,
    retry: false,
  })

  const patient = regData?.patient
  const poli = regData?.poli

  const saveMut = useMutation({
    mutationFn: (payload) => createMedicalRecord(payload),
    onSuccess: () => {
      showToast('Pemeriksaan SOAP dan Resep berhasil disimpan!')
      // Redirect ke rekam medis dengan pasien sudah terpilih
      setTimeout(() => navigate('/records', { state: { patient } }), 1200)
    },
    onError: (e) => showToast(e.response?.data?.message || 'Gagal menyimpan pemeriksaan'),
  })

  const addTindakan = () => setTindakan(prev => [...prev, { id: Date.now(), name: '', category: 'Diagnostik Fisik', notes: '' }])
  const removeTindakan = (id) => setTindakan(prev => prev.filter(r => r.id !== id))
  const updateTindakan = (id, field, val) => setTindakan(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const addResep = () => setResep(prev => [...prev, { id: Date.now(), medicine: '', dosage: '', qty: '', instruction: '' }])
  const removeResep = (id) => setResep(prev => prev.filter(r => r.id !== id))
  const updateResep = (id, field, val) => setResep(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))

  const handleCopyRM = async () => {
    const mrn = patient?.mrn || ''
    try { await navigator.clipboard.writeText(mrn); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!registrationId) return showToast('Pilih pasien dari halaman Antrean terlebih dahulu!')
    if (!subjective || !assessment) return showToast('Keluhan (S) dan Diagnosis (A) wajib diisi!')

    saveMut.mutate({
      registrationId: Number(registrationId),
      patientId: patient?.id,
      doctorId: user?.id,
      subjective,
      objective: `${objective}\nTD: ${bp} | Suhu: ${temp}°C | BB: ${weight}kg | TB: ${height}cm`.trim(),
      bp,
      temp: parseFloat(temp) || undefined,
      weight: parseFloat(weight) || undefined,
      height: parseFloat(height) || undefined,
      diagnosis: assessment,
      therapy: plan,
      actions: tindakan.filter(t => t.name.trim()).map(t => ({ name: t.name, cost: 0 })),
      prescription: resep.filter(r => r.medicine.trim()).length > 0 ? {
        notes: 'Resep Dokter',
        items: resep.filter(r => r.medicine.trim()).map(r => ({
          medicine: r.medicine,
          dosage: r.dosage,
          qty: parseInt(r.qty) || 1,
          instruction: r.instruction,
        })),
      } : undefined,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
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
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Dokter Login</span>
                <span className="text-sm font-bold text-primary">{user?.username || '-'}</span>
              </div>
            </div>
          </div>
          <nav className="px-2 space-y-1">
            <NavLink to="/doctor/queue" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">format_list_numbered</span>Antrean Pasien</NavLink>
            <NavLink to="/doctor" end className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">clinical_notes</span>Formulir SOAP</NavLink>
            <NavLink to="/records" className={({isActive}) => `doctor-nav-link ${isActive ? 'doctor-nav-link--active' : ''}`}><span className="material-symbols-outlined text-[1.25rem]">folder_shared</span>Rekam Medis</NavLink>
            <button onClick={handleLogout} className="doctor-nav-link doctor-nav-link--danger w-full text-left"><span className="material-symbols-outlined text-[1.25rem]">logout</span>Keluar</button>
          </nav>
        </div>
      </aside>

      <div className="doctor-main">
        <header className="doctor-topbar">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] rounded-full"><span className="h-2 w-2 rounded-full bg-[#00a874] animate-pulse" /><span className="text-xs font-bold text-[#005236]">Sesi Terbuka</span></span>
          </div>
          <div className="flex items-center gap-2.5 text-right">
            <div className="hidden sm:flex flex-col leading-none"><span className="text-sm font-bold text-primary">{user?.username || '-'}</span><span className="text-xs text-[#44474f]">Dokter Penanggung Jawab</span></div>
            <div className="w-8 h-8 rounded-full bg-[#b3ebff]/50 flex items-center justify-center text-secondary ring-2 ring-[#50d9fe]/30"><span className="material-symbols-outlined text-[1.2rem]">person</span></div>
          </div>
        </header>

        <main className="doctor-content">
          {/* Patient Info */}
          <section className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
            {!registrationId ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#c4c6d0]">assignment</span>
                <span className="text-sm font-semibold text-[#44474f]">Pilih pasien dari halaman Antrean untuk membuka formulir SOAP</span>
                <NavLink to="/doctor/queue" className="px-4 py-2 bg-[#001637] text-white rounded-lg text-sm font-bold">← Buka Halaman Antrean</NavLink>
              </div>
            ) : regLoading ? (
              <div className="py-8 text-center text-sm text-[#44474f]">Memuat data pasien...</div>
            ) : patient ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary shadow-sm ring-2 ring-[#e5eeff]"><span className="material-symbols-outlined text-[2rem]">person</span></div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a874] rounded-full ring-2 ring-white" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="font-headline text-[1.35rem] font-bold text-primary tracking-tight">{patient.name}</h1>
                        <span className="text-xs font-semibold text-[#44474f] bg-[#eff4ff] px-2 py-0.5 rounded-full">
                          {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                        <button onClick={handleCopyRM} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] px-2 py-0.5 rounded-md text-primary text-xs font-bold transition-colors" type="button">
                          <span className="material-symbols-outlined text-[0.85rem] text-secondary">content_copy</span>{copied ? 'Tersalin!' : patient.mrn}
                        </button>
                        <span className="text-xs text-[#44474f] hidden md:inline">NIK: {patient.nik}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 text-[#005c70] bg-[#b3ebff]/40 px-2 py-0.5 rounded-full text-xs font-bold">
                          <span className="material-symbols-outlined text-[0.85rem]">verified_user</span>{regData?.paymentType || 'Umum'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#eff4ff] px-2 py-0.5 rounded-full text-xs font-bold text-primary">
                          <span className="material-symbols-outlined text-[0.85rem]">stethoscope</span>{poli?.name || 'Poli Umum'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#eff4ff] px-2 py-0.5 rounded-full text-xs font-semibold text-[#44474f]">
                          Keluhan: {regData?.complaint || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vital Signs Input */}
                <div className="bg-[#eff4ff] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[1rem] text-secondary">vital_signs</span>
                    <span className="text-xs uppercase tracking-wider text-[#44474f] font-bold">Input Tanda Vital</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] text-[#44474f] font-semibold">TD (mmHg)</label>
                      <input value={bp} onChange={e => setBp(e.target.value)} className="w-full bg-white border border-[#c4c6d0]/60 rounded-lg px-2 py-1 text-sm focus:outline-none" placeholder="120/80" />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#44474f] font-semibold">Suhu (°C)</label>
                      <input value={temp} onChange={e => setTemp(e.target.value)} type="number" step="0.1" className="w-full bg-white border border-[#c4c6d0]/60 rounded-lg px-2 py-1 text-sm focus:outline-none" placeholder="36.5" />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#44474f] font-semibold">BB (kg)</label>
                      <input value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.1" className="w-full bg-white border border-[#c4c6d0]/60 rounded-lg px-2 py-1 text-sm focus:outline-none" placeholder="65" />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#44474f] font-semibold">TB (cm)</label>
                      <input value={height} onChange={e => setHeight(e.target.value)} type="number" step="0.1" className="w-full bg-white border border-[#c4c6d0]/60 rounded-lg px-2 py-1 text-sm focus:outline-none" placeholder="165" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-sm text-[#ba1a1a]">Data registrasi tidak ditemukan (ID: {registrationId})</div>
            )}
          </section>

          {registrationId && patient && (
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              <section className="bg-white rounded-xl shadow-sm p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[1.25rem] text-primary">edit_note</span><h2 className="font-headline text-base font-bold text-primary">Catatan Perkembangan Pasien (SOAP)</h2></div></div>

                <div className="soap-card">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">record_voice_over</span><label className="text-sm font-bold text-primary">S — Subjektif (Keluhan & Anamnesis)</label></div>
                  <textarea value={subjective} onChange={e => setSubjective(e.target.value)} rows={3} className="soap-textarea" placeholder="Tuliskan keluhan utama, riwayat perjalanan penyakit..." />
                </div>

                <div className="soap-card">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">stethoscope</span><label className="text-sm font-bold text-primary">O — Objektif (Pemeriksaan Fisik)</label></div>
                  <textarea value={objective} onChange={e => setObjective(e.target.value)} rows={3} className="soap-textarea" placeholder="Hasil inspeksi, palpasi, perkusi, auskultasi..." />
                </div>

                <div className="soap-card">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">assignment</span><label className="text-sm font-bold text-primary">A — Asesmen & Diagnosis (ICD-10)</label></div>
                  <input value={assessment} onChange={e => setAssessment(e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/60 rounded-lg px-3 py-2 text-sm font-semibold text-primary focus:ring-2 focus:ring-[#00677d] focus:outline-none" placeholder="cth. A90 • Dengue Fever" />
                </div>

                <div className="soap-card">
                  <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[1.15rem]">fact_check</span><label className="text-sm font-bold text-primary">P — Plan (Rencana Terapi & Edukasi)</label></div>
                  <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} className="soap-textarea" placeholder="Rencana tatalaksana, anjuran, rujukan..." />
                </div>
              </section>

              <section className="bg-white rounded-xl border border-[#c4c6d0]/40 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[1.2rem]">medical_services</span></div><h3 className="font-headline text-sm font-bold text-primary">Tindakan Medis</h3></div>
                  <button type="button" onClick={addTindakan} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-primary px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><span className="material-symbols-outlined text-[1.05rem] text-secondary">add_circle</span>+ Tambah Tindakan</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead className="text-xs text-[#44474f] bg-[#eff4ff]/70"><tr><th className="py-2 px-3 font-semibold">Nama Tindakan</th><th className="py-2 px-3 font-semibold w-48">Kategori</th><th className="py-2 px-3 font-semibold">Catatan</th><th className="py-2 px-2 text-center w-12">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-[#eff4ff] text-sm">
                      {tindakan.map(row => (
                        <tr key={row.id} className="hover:bg-[#eff4ff]/30">
                          <td className="py-2.5 px-3"><input value={row.name} onChange={e => updateTindakan(row.id, 'name', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Nama prosedur" /></td>
                          <td className="py-2.5 px-3"><select value={row.category} onChange={e => updateTindakan(row.id, 'category', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary">{kategoriOptions.map(o => <option key={o}>{o}</option>)}</select></td>
                          <td className="py-2.5 px-3"><input value={row.notes} onChange={e => updateTindakan(row.id, 'notes', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Keterangan..." /></td>
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
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[1.2rem]">prescriptions</span></div><h3 className="font-headline text-sm font-bold text-primary">Resep Obat</h3></div>
                  <button type="button" onClick={addResep} className="inline-flex items-center gap-1 bg-primary hover:bg-[#0d2b56] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"><span className="material-symbols-outlined text-[1.05rem]">add_circle</span>+ Tambah Obat</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead className="text-xs text-[#44474f] bg-[#eff4ff]/70"><tr><th className="py-2 px-3 font-semibold">Nama Obat</th><th className="py-2 px-3 font-semibold w-52">Dosis / Aturan Pakai</th><th className="py-2 px-3 font-semibold w-32">Jumlah</th><th className="py-2 px-3 font-semibold">Instruksi</th><th className="py-2 px-2 text-center w-12">Aksi</th></tr></thead>
                    <tbody className="divide-y divide-[#eff4ff] text-sm">
                      {resep.map(row => (
                        <tr key={row.id} className="hover:bg-[#eff4ff]/30">
                          <td className="py-2.5 px-3"><input value={row.medicine} onChange={e => updateResep(row.id, 'medicine', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Nama obat..." /></td>
                          <td className="py-2.5 px-3"><input value={row.dosage} onChange={e => updateResep(row.id, 'dosage', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Aturan pakai..." /></td>
                          <td className="py-2.5 px-3"><input value={row.qty} onChange={e => updateResep(row.id, 'qty', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Jml..." /></td>
                          <td className="py-2.5 px-3"><input value={row.instruction} onChange={e => updateResep(row.id, 'instruction', e.target.value)} className="w-full bg-[#f8f9ff] border border-[#c4c6d0]/50 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-secondary" placeholder="Catatan..." /></td>
                          <td className="py-2.5 px-2 text-center"><button type="button" onClick={() => removeResep(row.id)} className="p-1.5 rounded-lg text-[#747780] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40"><span className="material-symbols-outlined text-[1.1rem]">delete</span></button></td>
                        </tr>
                      ))}
                      {resep.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-sm text-[#747780]">Belum ada resep. Klik + Tambah Obat.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-[#c4c6d0]/40 shadow-md flex flex-wrap items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2 text-xs text-[#44474f]">
                  <span className="w-2 h-2 rounded-full bg-[#00a874] animate-pulse" />
                  Data akan disimpan ke database MySQL
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={saveMut.isPending} className="inline-flex items-center gap-1.5 bg-primary hover:bg-[#0d2b56] text-white px-5 py-2 rounded-lg text-xs font-bold shadow disabled:opacity-50">
                    <span className="material-symbols-outlined text-[1.05rem] text-[#b3ebff]">verified</span>
                    {saveMut.isPending ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
