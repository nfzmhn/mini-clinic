import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRecordsByPatient } from '../../../services/medicalRecord'
import api from '../../../services/api'
import './MedicalRecordsPage.css'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
}

export default function MedicalRecordsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  const [q, setQ] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  // Jika datang dari halaman SOAP, langsung set pasien dari state navigasi
  const [selectedPatient, setSelectedPatient] = useState(location.state?.patient || null)
  const [copied, setCopied] = useState(false)

  // Reset search input saat pasien dipilih dari state
  useEffect(() => {
    if (location.state?.patient) {
      setPatientSearch('')
    }
  }, [location.state?.patient])

  // Search patients
  const { data: patientsData } = useQuery({
    queryKey: ['patient-search-records', patientSearch],
    queryFn: async () => {
      if (!patientSearch) return []
      const { data } = await api.get('/patients', { params: { q: patientSearch, limit: 10 } })
      return Array.isArray(data) ? data : (data?.data?.data || data?.data || [])
    },
    enabled: patientSearch.length >= 2,
  })

  const patientResults = Array.isArray(patientsData) ? patientsData : []

  // Load records for selected patient
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['medical-records', selectedPatient?.id],
    queryFn: () => getRecordsByPatient(selectedPatient.id),
    enabled: !!selectedPatient,
  })

  const records = (() => {
    if (!recordsData) return []
    const d = recordsData?.data || recordsData
    return Array.isArray(d) ? d : []
  })()

  const filtered = records.filter(r => {
    if (!q) return true
    const hay = `${r.subjective || ''} ${r.diagnosis || ''} ${r.registration?.poli?.name || ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(selectedPatient?.mrn || ''); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="doctor-page">
      <aside className="doctor-sidebar">
        <div className="flex flex-col">
          <div className="h-16 px-4 flex items-center gap-3 bg-white border-b border-[#c4c6d0]/20">
            <img alt="Medvita" className="h-8 w-auto object-contain" src="/logo.png" />
            <div className="flex flex-col"><span className="font-headline text-[1.05rem] font-bold text-primary leading-none">Medvita</span><span className="text-[0.68rem] font-bold text-secondary tracking-widest uppercase">Clinical OS</span></div>
          </div>
          <div className="p-4">
            <div className="p-3 bg-[#e5eeff] rounded-xl flex items-center justify-between">
              <div className="flex flex-col"><span className="text-[0.7rem] font-bold text-[#44474f] uppercase tracking-wider">Dokter</span><span className="text-sm font-bold text-primary">{user?.username || '-'}</span></div>
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
            <div className="hidden sm:flex flex-col leading-none"><span className="text-sm font-bold text-primary">{user?.username || '-'}</span><span className="text-xs text-[#44474f]">Dokter</span></div>
            <div className="w-8 h-8 rounded-full bg-[#b3ebff]/50 flex items-center justify-center text-secondary ring-2 ring-[#50d9fe]/30"><span className="material-symbols-outlined text-[1.2rem]">person</span></div>
          </div>
        </header>

        <main className="doctor-content">
          {/* Banner: baru selesai dari SOAP */}
          {location.state?.patient && (
            <div className="flex items-center gap-3 bg-[#6ffbbe]/20 border border-[#00a874]/30 rounded-xl p-4">
              <span className="material-symbols-outlined text-[#00a874] text-2xl">check_circle</span>
              <div>
                <p className="text-sm font-bold text-[#005236]">Pemeriksaan SOAP berhasil disimpan ke database!</p>
                <p className="text-xs text-[#44474f]">Rekam medis terbaru untuk <b>{location.state.patient.name}</b> ({location.state.patient.mrn}) sudah muncul di bawah.</p>
              </div>
              <button
                onClick={() => navigate('/records', { replace: true, state: {} })}
                className="ml-auto text-[#747780] hover:text-[#ba1a1a]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Patient Search — sembunyikan jika pasien sudah dipilih */}
          {!selectedPatient && (
          <section className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary">search</span>
              <h2 className="font-headline text-base font-bold text-primary">Cari Pasien</h2>
            </div>
            <div className="relative">
              <input
                value={patientSearch}
                onChange={e => setPatientSearch(e.target.value)}
                placeholder="Ketik nama, NIK, atau No. RM pasien..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#747780] text-[18px]">search</span>
            </div>
            {patientResults.length > 0 && (
              <div className="mt-2 bg-white border border-[#c4c6d0]/40 rounded-xl overflow-hidden shadow-sm">
                {patientResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setPatientSearch('') }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#eff4ff] flex items-center justify-between border-b border-[#c4c6d0]/20 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-sm text-primary">{p.name}</span>
                      <span className="text-xs text-[#747780] ml-2">NIK: {p.nik}</span>
                    </div>
                    <span className="text-xs font-bold text-secondary bg-[#eff4ff] px-2 py-0.5 rounded">{p.mrn}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
          )} {/* end !selectedPatient search */}

          {/* Patient header */}
          {selectedPatient && (
            <section className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary ring-2 ring-[#e5eeff]"><span className="material-symbols-outlined text-[2rem]">person</span></div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a874] rounded-full ring-2 ring-white" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-headline text-[1.35rem] font-bold text-primary tracking-tight">{selectedPatient.name}</h1>
                      <span className="text-xs font-semibold text-[#44474f] bg-[#eff4ff] px-2 py-0.5 rounded-full">{selectedPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      <button onClick={handleCopy} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] px-2 py-0.5 rounded-md text-primary text-xs font-bold" type="button">
                        <span className="material-symbols-outlined text-[0.85rem] text-secondary">content_copy</span>{copied ? 'Tersalin!' : selectedPatient.mrn}
                      </button>
                      <span className="text-xs text-[#44474f] hidden md:inline">NIK: {selectedPatient.nik}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-xs text-[#44474f] hover:text-[#ba1a1a] px-2 py-1 rounded-lg hover:bg-[#ffdad6]">Ganti Pasien</button>
              </div>
            </section>
          )}

          {/* Search filter */}
          {selectedPatient && (
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
                <input value={q} onChange={e => setQ(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari anamnesis, diagnosis, poli..." />
              </div>
            </section>
          )}

          {/* Records timeline */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">timeline</span>
                <h2 className="font-headline text-base font-bold text-primary">Kronologi Riwayat Rekam Medis</h2>
              </div>
              {selectedPatient && <span className="text-xs font-semibold text-[#747780]">Menampilkan {filtered.length} Entri</span>}
            </div>

            {!selectedPatient ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#c4c6d0]">folder_shared</span>
                <p className="text-sm text-[#747780] mt-2">Cari dan pilih pasien untuk melihat riwayat rekam medis</p>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-xl p-8 text-center text-sm text-[#44474f]">Memuat rekam medis...</div>
            ) : (
              <div className="relative flex flex-col gap-4">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#d3e4fe] hidden sm:block" />
                {filtered.map((v, i) => (
                  <article key={v.id} className="relative sm:pl-12 flex flex-col">
                    <div className="hidden sm:flex absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0d2b56] ring-4 ring-[#f8f9ff] items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" /></div>
                    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#eff4ff]/40 -mx-5 -mt-5 p-3 rounded-t-xl mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {i === 0 && <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold">Kunjungan Terbaru</span>}
                          <span className="text-sm font-bold text-primary">{formatDate(v.createdAt)} • {formatTime(v.createdAt)}</span>
                          <span className="text-[#c4c6d0]">•</span>
                          <span className="text-sm font-bold text-secondary">{v.registration?.poli?.name || 'Poli Umum'}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#005236] text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#00a874]" />{v.registration?.status || 'Selesai'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3 bg-[#eff4ff]/30 p-2 rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-[#dce9ff] flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[16px]">stethoscope</span></div>
                        <span className="text-xs text-[#44474f]">DPJP: <b className="text-primary">{v.registration?.doctor?.username || '-'}</b></span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-6 flex flex-col gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold">Keluhan Utama (S)</span>
                          <div className="bg-[#eff4ff] p-3 rounded-lg text-sm text-primary leading-relaxed">{v.subjective || '-'}</div>
                          <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Pemeriksaan Fisik (O) & Tanda Vital</span>
                          <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              {v.bp && <span>TD: <b className="text-primary">{v.bp}</b></span>}
                              {v.temp && <span>Suhu: <b className="text-primary">{v.temp}°C</b></span>}
                              {v.weight && <span>BB: <b className="text-primary">{v.weight} kg</b></span>}
                              {v.height && <span>TB: <b className="text-primary">{v.height} cm</b></span>}
                            </div>
                            {v.objective && <div className="text-xs text-primary pt-1 border-t border-[#dce9ff]/50 mt-1">{v.objective}</div>}
                          </div>
                        </div>

                        <div className="lg:col-span-6 flex flex-col gap-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold">Diagnosis (A)</span>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-[#e5eeff]">
                              <span className="text-sm font-bold text-primary">{v.diagnosis || '-'}</span>
                            </div>
                          </div>

                          <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Rencana Terapi (P)</span>
                          <div className="bg-[#eff4ff] p-3 rounded-lg text-sm text-primary">{v.therapy || '-'}</div>

                          {v.prescription?.items?.length > 0 && (
                            <>
                              <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Resep Farmasi</span>
                              <div className="bg-[#dce9ff]/40 p-3 rounded-lg flex flex-col gap-1.5">
                                {v.prescription.items.map(r => (
                                  <div key={r.id} className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-primary">{r.medicine}</span>
                                    <span className="text-[#44474f]">{r.dosage} • {r.qty}x</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {v.actions?.length > 0 && (
                            <>
                              <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Tindakan Medis</span>
                              <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1">
                                {v.actions.map(t => (
                                  <div key={t.id} className="flex items-center gap-2 text-sm text-primary"><span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>{t.name}</div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {filtered.length === 0 && (
                  <div className="bg-white rounded-xl p-8 text-center text-sm text-[#747780]">
                    {records.length === 0 ? 'Pasien ini belum memiliki rekam medis.' : 'Tidak ada rekam medis cocok filter.'}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
