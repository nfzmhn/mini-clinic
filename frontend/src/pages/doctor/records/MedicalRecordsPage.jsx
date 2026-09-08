import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './MedicalRecordsPage.css'

const visits = [
  {
    id: 1,
    badge: 'Kunjungan Hari Ini',
    date: '24 Okt 2024',
    time: '08:30 WIB',
    poli: 'Poli Umum',
    status: 'Selesai Pemeriksaan',
    doctor: 'dr. Danang Wicaksono, Sp.PD',
    complaint: 'Demam naik turun sejak 3 hari yang lalu, disertai keluhan pusing berdenyut, rasa mual, dan pegal pada persendian bilateral. Tidak ada riwayat mimisan maupun gusi berdarah.',
    vitals: { td: '120/80 mmHg', nadi: '78 x/m', suhu: '38.2 °C', suhuTriase: '36.6 °C' },
    fisik: 'Uji Rumple Leed (+) positif petekie pada regio antebrachii anterior.',
    diagnoses: [
      { type: 'Primer', code: 'A90', name: 'Dengue Fever', desc: 'Demam Dengue' },
      { type: 'Sekunder', code: 'R11.0', name: 'Nausea with vomiting', desc: 'Mual Muntah' },
    ],
    tindakan: ['Pemeriksaan Uji Torniquet (Rumple Leed)'],
    resep: [
      { name: 'Paracetamol 500mg Tablet', aturan: '3 x 1 tablet sesudah makan', qty: '10 Tablet' },
      { name: 'Oralit Sachet', aturan: '1 sachet / 200ml air', qty: '6 Sachet' },
    ],
  },
  {
    id: 2,
    badge: null,
    date: '15 Mei 2024',
    time: '10:15 WIB',
    poli: 'Poli Umum',
    status: 'Selesai',
    doctor: 'dr. Danang Wicaksono, Sp.PD',
    complaint: 'Nyeri ulu hati dirasakan sejak 2 hari, terasa perih saat telat makan, disertai kembung dan sering bersendawa. Riwayat dispepsia berulang.',
    vitals: { td: '118/78 mmHg', nadi: '82 x/m', suhu: '36.8 °C', suhuTriase: '36.7 °C' },
    fisik: 'Abdomen supel, nyeri tekan epigastrium (+), bising usus normal.',
    diagnoses: [
      { type: 'Primer', code: 'K29.7', name: 'Gastritis', desc: 'Gastritis unspecified' },
    ],
    tindakan: ['Edukasi diet dan pola makan teratur'],
    resep: [
      { name: 'Omeprazole 20mg Kapsul', aturan: '1 x 1 kapsul sebelum makan', qty: '14 Kapsul' },
      { name: 'Antasida Sirup', aturan: '3 x 1 sendok takar', qty: '1 Botol' },
    ],
  },
  {
    id: 3,
    badge: null,
    date: '08 Jan 2024',
    time: '14:00 WIB',
    poli: 'Poli Umum',
    status: 'Selesai',
    doctor: 'dr. Siti Rahmawati, Sp.A',
    complaint: 'Batuk pilek berdahak dialami sejak 4 hari, hidung tersumbat terutama pada malam dan pagi hari, tenggorokan terasa gatal. Sesak nafas disangkal, riwayat kontak dengan debu.',
    vitals: { td: '110/70 mmHg', nadi: '88 x/m', suhu: '37.1 °C', suhuTriase: '36.9 °C' },
    fisik: 'Faring hiperemis (+), tonsil T1-T1, rhonki -/-.',
    diagnoses: [
      { type: 'Primer', code: 'J00', name: 'Acute nasopharyngitis', desc: 'Common Cold' },
    ],
    tindakan: [],
    resep: [
      { name: 'Cetirizine 10mg Tablet', aturan: '1 x 1 tablet (malam hari)', qty: '5 Tablet' },
      { name: 'GG (Guaifenesin) 100mg Tablet', aturan: '3 x 1 tablet (post coenam)', qty: '9 Tablet' },
    ],
  },
]

export default function MedicalRecordsPage() {
  const [q, setQ] = useState('')
  const [year, setYear] = useState('Semua')
  const [layanan, setLayanan] = useState('Semua Layanan')
  const [copied, setCopied] = useState(false)

  const filtered = visits.filter(v => {
    const hay = `${v.complaint} ${v.diagnoses.map(d=>`${d.code} ${d.name}`).join(' ')} ${v.doctor} ${v.poli}`.toLowerCase()
    const matchQ = !q || hay.includes(q.toLowerCase())
    const matchYear = year === 'Semua' || v.date.includes(year)
    const matchLayanan = layanan === 'Semua Layanan' || (layanan === 'Rawat Jalan' && v.poli.includes('Poli'))
    return matchQ && matchYear && matchLayanan
  })

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText('RM-0001'); setCopied(true); setTimeout(()=>setCopied(false), 1800) } catch {}
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
                  <div className="w-14 h-14 rounded-full bg-[#eff4ff] flex items-center justify-center text-primary ring-2 ring-[#e5eeff]"><span className="material-symbols-outlined text-[2rem]">person</span></div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a874] rounded-full ring-2 ring-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-headline text-[1.35rem] font-bold text-primary tracking-tight">Budi Pratama</h1>
                    <span className="text-xs font-semibold text-[#44474f] bg-[#eff4ff] px-2 py-0.5 rounded-full">34 Thn • Laki-laki (L)</span>
                    <button onClick={handleCopy} className="inline-flex items-center gap-1 bg-[#eff4ff] hover:bg-[#dce9ff] px-2 py-0.5 rounded-md text-primary text-xs font-bold" type="button"><span className="material-symbols-outlined text-[0.85rem] text-secondary">content_copy</span>{copied ? 'Tersalin!' : 'RM-0001'}</button>
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
                <span className="flex items-baseline gap-1"><span className="text-xs text-[#44474f]">BB / TB:</span><b className="text-primary">68 <span className="font-normal text-xs">kg</span> / 172 <span className="font-normal text-xs">cm</span></b></span>
                <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-xs font-bold text-[#005236]"><span className="w-1.5 h-1.5 rounded-full bg-[#00a874]" />IMT 23.0 (Normal)</span>
              </div>
            </div>
          </section>

          <section className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-secondary flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">history_edu</span></div>
              <div className="flex flex-col"><div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">Riwayat Penyakit Dahulu</span><span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#44474f]">Kronis</span></div><span className="text-[11px] text-[#747780]">Pemberian PPI berkala saat eksaserbasi</span></div>
            </div>
            <div className="flex flex-wrap gap-1.5"><span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-bold text-primary">Dispepsia Fungsional (2023)</span><span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-bold text-primary">Rhinitis Alergi</span></div>
          </section>

          <section className="bg-white rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747780] text-[20px]">search</span>
              <input value={q} onChange={e=>setQ(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#eff4ff] text-sm text-primary placeholder:text-[#747780] focus:outline-none focus:ring-2 focus:ring-[#00677d]/30" placeholder="Cari anamnesis, kode diagnosis ICD-10, dokter penanggung jawab, tindakan..." />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#eff4ff] rounded-lg p-1">
                {['Semua','2024','2023'].map(y => (
                  <button key={y} onClick={()=>setYear(y)} className={`px-3 py-1 rounded text-xs font-bold ${year===y ? 'bg-white text-primary shadow-sm' : 'text-[#44474f] hover:text-primary'}`}>{y}</button>
                ))}
              </div>
              <div className="flex items-center bg-[#eff4ff] rounded-lg p-1">
                {['Semua Layanan','Rawat Jalan','IGD','Laboratorium'].map(v => (
                  <button key={v} onClick={()=>setLayanan(v)} className={`px-3 py-1 rounded text-xs font-bold ${layanan===v ? 'bg-white text-primary shadow-sm' : 'text-[#44474f] hover:text-primary'}`}>{v}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[22px]">timeline</span><h2 className="font-headline text-base font-bold text-primary">Kronologi Riwayat Rekam Medis</h2></div>
              <span className="text-xs font-semibold text-[#747780]">Menampilkan {filtered.length} Entri</span>
            </div>

            <div className="relative flex flex-col gap-4">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#d3e4fe] hidden sm:block" />
              {filtered.map(v => (
                <article key={v.id} className="relative sm:pl-12 flex flex-col">
                  <div className="hidden sm:flex absolute left-2.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0d2b56] ring-4 ring-[#f8f9ff] items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" /></div>
                  <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#eff4ff]/40 -mx-5 -mt-5 p-3 rounded-t-xl mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {v.badge && <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold">{v.badge}</span>}
                        <span className="text-sm font-bold text-primary">{v.date} • {v.time}</span>
                        <span className="text-[#c4c6d0]">•</span>
                        <span className="text-sm font-bold text-secondary">{v.poli}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#005236] text-xs font-bold"><span className="w-2 h-2 rounded-full bg-[#00a874]" />{v.status}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 bg-[#eff4ff]/30 p-2 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-[#dce9ff] flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[16px]">stethoscope</span></div>
                      <span className="text-xs text-[#44474f]">Dokter Penanggung Jawab (DPJP): <b className="text-primary">{v.doctor}</b></span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-6 flex flex-col gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold">Keluhan Utama & Anamnesis</span>
                        <div className="bg-[#eff4ff] p-3 rounded-lg text-sm text-primary leading-relaxed">{v.complaint}</div>
                        <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Pemeriksaan Fisik & Tanda Vital</span>
                        <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span>TD: <b className="text-primary">{v.vitals.td}</b></span>
                            <span>Nadi: <b className="text-primary">{v.vitals.nadi}</b></span>
                            <span>Suhu: <b className="text-[#ba1a1a]">{v.vitals.suhu}</b> <span className="text-[#747780] text-[11px]">(Triase: {v.vitals.suhuTriase})</span></span>
                          </div>
                          <div className="text-xs text-primary pt-1 border-t border-[#dce9ff]/50 mt-1">Temuan Fisik: <b>{v.fisik}</b></div>
                        </div>
                      </div>

                      <div className="lg:col-span-6 flex flex-col gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold">Diagnosis ICD-10</span>
                        <div className="flex flex-col gap-1.5">
                          {v.diagnoses.map(d => (
                            <div key={d.code} className={`flex items-center justify-between p-2 rounded-lg ${d.type==='Primer' ? 'bg-[#e5eeff]' : 'bg-[#eff4ff]'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${d.type==='Primer' ? 'bg-primary text-white' : 'bg-[#dce9ff] text-primary'}`}>{d.type}</span>
                                <span className="text-sm font-bold text-primary">{d.code} - {d.name}</span>
                              </div>
                              <span className="text-xs text-[#44474f]">{d.desc}</span>
                            </div>
                          ))}
                        </div>
                        {v.tindakan.length > 0 && (
                          <>
                            <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Tindakan Medis Dilakukan</span>
                            <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1">
                              {v.tindakan.map(t => (
                                <div key={t} className="flex items-center gap-2 text-sm text-primary"><span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>{t}</div>
                              ))}
                            </div>
                          </>
                        )}
                        <span className="text-[11px] uppercase tracking-wider text-[#747780] font-bold mt-1">Terapi & Resep Farmasi</span>
                        <div className="bg-[#dce9ff]/40 p-3 rounded-lg flex flex-col gap-1.5">
                          {v.resep.map(r => (
                            <div key={r.name} className="flex items-center justify-between text-xs">
                              <span className="font-bold text-primary">{r.name}</span>
                              <span className="text-[#44474f]">{r.aturan} • {r.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {filtered.length===0 && <div className="bg-white rounded-xl p-8 text-center text-sm text-[#747780]">Tidak ada riwayat cocok filter.</div>}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
