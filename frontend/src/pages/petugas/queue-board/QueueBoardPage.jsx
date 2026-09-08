import { useEffect, useState, useCallback } from 'react'
import { subscribeQueueUpdate } from '../../../services/queueSync'
import './QueueBoardPage.css'

const queues = [
  { room: 'POLI UMUM — RUANG PERIKSA 01', doctor: 'dr. Danang Wicaksono, Sp.PD', current: { ticket: 'A-012', name: 'Budi Pratama' }, pool: [{ ticket: 'A-013', name: 'Siti Aminah' }, { ticket: 'A-014', name: 'Hendra Gunawan' }, { ticket: 'A-015', name: 'Ratna Sari' }] },
]

export default function QueueBoardPage() {
  const [idx, setIdx] = useState(0)
  const [current, setCurrent] = useState(queues[0].current)
  const [pools, setPools] = useState(queues.map(q => [...q.pool]))
  const [clock, setClock] = useState(new Date())
  const [pulse, setPulse] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '' })
  const poli = queues[idx]

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const unsub = subscribeQueueUpdate((data) => {
      if (data.type === 'CALL_NEXT') {
        setCurrent({ ticket: data.ticket, name: data.name })
        triggerCall(data.ticket, data.name)
      }
    })
    return unsub
  }, [])

  const chime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const playTone = (freq, start, dur) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
        osc.connect(gain); gain.connect(ctx.destination)
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur)
      }
      playTone(587.33, 0, 0.45); playTone(739.99, 0.25, 0.45); playTone(880, 0.5, 0.7)
    } catch {}
  }, [])

  const triggerCall = useCallback((ticket, name) => {
    chime()
    setPulse(true)
    setToast({ show: true, msg: `Panggilan: "${ticket} - ${name}"` })
    setTimeout(() => setPulse(false), 800)
    setTimeout(() => setToast({ show: false, msg: '' }), 3200)
  }, [chime])

  useEffect(() => {
    setCurrent(queues[idx].current)
  }, [idx])

  const handleNext = () => {
    const pool = pools[idx]
    if (pool.length > 0) {
      const next = pool[0]
      const newPools = pools.map((p, i) => i === idx ? p.slice(1) : p)
      setPools(newPools)
      setCurrent(next)
      triggerCall(next.ticket, next.name)
    }
  }

  const handleRecall = () => triggerCall(current.ticket, current.name)

  const handleSwitch = () => {
    const nextIdx = (idx + 1) % queues.length
    setIdx(nextIdx)
    const c = queues[nextIdx].current
    triggerCall(c.ticket, c.name)
  }

  const dateStr = clock.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <div className="queue-board">
      <div className="queue-board__glow1" />
      <div className="absolute -bottom-32 right-1/4 w-[560px] h-[360px] bg-[#6ffbbe]/15 blur-3xl pointer-events-none" />

      {toast.show && (
        <div className="queue-toast">
          <span className="material-symbols-outlined text-[#50d9fe] animate-bounce text-2xl">volume_up</span>
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      <header className="queue-header">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0d2b56] flex items-center justify-center text-white shadow-md"><span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span></div>
          <div>
            <div className="flex items-center gap-3"><h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#001637] tracking-tight">Medvita Clinic</h1><span className="w-2 h-2 rounded-full bg-[#00677d]" /><span className="font-medium text-base text-[#44474f]">Layar Antrean Poliklinik</span></div>          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 bg-[#eff4ff] px-7 py-3 rounded-xl border border-[#dce9ff]/50">
          <div className="text-right"><div className="font-semibold text-sm text-[#44474f]">{dateStr}</div><div className="text-xs font-medium text-[#00677d]">Zona Waktu Indonesia Barat</div></div>
          <div className="h-10 w-px bg-[#d3e4fe]" />
          <div className="flex items-baseline gap-1.5"><span className="font-display font-extrabold text-3xl md:text-4xl text-[#001637] tracking-tight tabular-nums">{timeStr}</span><span className="font-bold text-xs text-[#44474f]">WIB</span></div>
        </div>
      </header>

      <main className="queue-hero">
        <div className={`queue-hero__card ${pulse ? 'queue-hero__card--pulse' : ''}`}>
          <div className="queue-hero__accent">
            <div className="flex items-center gap-3"><span className="relative flex h-3.5 w-3.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6ffbbe] opacity-80" /><span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#4edea3]" /></span><span className="font-display font-bold tracking-widest text-sm uppercase text-[#6ffbbe]">SEDANG DIPANGGIL • CURRENT CALL</span></div>
            <div className="flex items-center gap-2 text-[#7a93c4]"><span className="material-symbols-outlined text-xl animate-pulse text-[#50d9fe]">graphic_eq</span><span className="text-xs font-semibold tracking-wider">PENGUMUMAN SUARA ELEKTRONIK</span></div>
          </div>
          <div className="p-8 md:p-14 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-[#dce9ff]/90 text-[#001637] shadow-sm mb-4 border border-[#d3e4fe]">
              <span className="material-symbols-outlined text-[#00677d] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>meeting_room</span>
              <span className="font-display font-bold text-xl md:text-2xl uppercase">{poli.room}</span>
              <span className="text-[#c4c6d0] font-bold">•</span>
              <div className="flex items-center gap-1.5 text-[#44474f] text-base font-semibold"><span className="material-symbols-outlined text-lg">stethoscope</span>{poli.doctor}</div>
            </div>
            <div className="my-3 relative flex items-center justify-center py-2 px-12">
              <div className="absolute inset-0 bg-[#50d9fe]/20 rounded-full blur-3xl pointer-events-none scale-125" />
              <span className={`queue-hero__ticket ${pulse ? 'queue-hero__ticket--pulse' : ''}`}>{current.ticket}</span>
            </div>
            <div className="flex flex-col items-center gap-1 mb-7">
              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-bold text-[#44474f] uppercase tracking-widest">NAMA PASIEN:</span>
                <span className="queue-hero__patient">{current.name}</span>
              </div>
            </div>
            <div className="queue-hero__direction">
              <span className="material-symbols-outlined text-2xl text-[#6ffbbe] font-bold">arrow_forward_ios</span>
              <span className="font-display text-lg md:text-xl font-bold tracking-wide">Silakan Masuk Menuju Ruang Periksa 01</span>
            </div>
          </div>
          <div className="bg-[#e5eeff]/60 border-t border-[#dce9ff] px-8 py-3 flex items-center justify-between text-[#44474f] text-sm">
            <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#00677d] text-base">verified</span><span className="font-semibold text-[#001637]">BPJS &amp; Asuransi Terverifikasi</span></div>
            <div className="flex items-center gap-5"><span>Kategori: <strong className="text-[#001637]">Reguler / Non-Emergency</strong></span><span>• Rata-rata Sesi: <strong className="text-[#001637]">12 Menit</strong></span></div>
          </div>
        </div>
      </main>

      <aside className="queue-controls">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-[#001637] font-semibold text-xs" onClick={handleRecall}><span className="material-symbols-outlined text-sm text-[#00677d]">repeat</span>Panggil Ulang</button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d2b56] hover:bg-[#001637] text-white font-semibold text-xs" onClick={handleNext}><span className="material-symbols-outlined text-sm text-[#6ffbbe]">skip_next</span>Panggil Berikutnya</button>
      </aside>
    </div>
  )
}
