import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import './PatientRegistrationModal.css'

const schema = z.object({
  pasien: z.string().min(3, 'Nama pasien wajib diisi'),
  dokter: z.string().min(1, 'Dokter wajib dipilih'),
  poli: z.string().min(1, 'Poli wajib dipilih'),
  tanggalKunjungan: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
  jenisPembayaran: z.enum(['BPJS', 'UMUM', 'ASURANSI']),
  keluhanAwal: z.string().min(5, 'Keluhan awal wajib diisi'),
  td: z.string().optional(),
  nadi: z.string().optional(),
  suhu: z.string().optional(),
  bb: z.string().optional(),
  tb: z.string().optional(),
})

const dokterOptions = ['dr. Danang Wicaksono', 'drg. Siti Lestari', 'dr. Rina Amelia, Sp.A', 'dr. Hendra Kurniawan']
const poliOptions = ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Kandungan']

function calcPreviewMrn(count) {
  return `A${String(count + 1).padStart(3, '0')}`
}

export default function PatientRegistrationModal({ isOpen, onClose, onSubmit, patientCount = 0 }) {
  const [serverError, setServerError] = useState('')
  const previewMrn = calcPreviewMrn(patientCount)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { dokter: dokterOptions[0], poli: poliOptions[0], jenisPembayaran: 'BPJS', tanggalKunjungan: new Date().toISOString().slice(0, 10) },
  })

  useEffect(() => {
    if (isOpen) {
      reset({ pasien: '', dokter: dokterOptions[0], poli: poliOptions[0], jenisPembayaran: 'BPJS', tanggalKunjungan: new Date().toISOString().slice(0, 10), keluhanAwal: '', td: '', nadi: '', suhu: '', bb: '', tb: '' })
      setServerError('')
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  const onFormSubmit = async (data) => {
    setServerError('')
    try {
      await onSubmit({ ...data, name: data.pasien, doctor: data.dokter, paymentType: data.jenisPembayaran })
      reset()
      onClose()
    } catch (e) {
      setServerError(e.message || 'Gagal menyimpan data pasien')
    }
  }

  return (
    <div className="patient-modal__overlay" onClick={onClose}>
      <div className="patient-modal__card" onClick={e => e.stopPropagation()}>
        <div className="patient-modal__header">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#001637]">Pendaftaran Pasien Baru</span>
              <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-semibold">{previewMrn}</span>
            </div>
            <p className="text-xs text-[#44474f]">Kode auto-generate: {previewMrn} (A001, A002, ...)</p>
          </div>
          <button type="button" className="p-2 rounded-lg hover:bg-[#dce9ff] text-[#44474f]" onClick={onClose}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="patient-modal__body" noValidate>
          <div className="flex items-center bg-[#e5eeff] px-3 py-2 rounded-lg gap-2">
            <span className="material-symbols-outlined text-sm text-[#00677d]">tag</span>
            <span className="text-sm font-bold text-[#001637]">{previewMrn}</span>
            <span className="text-xs text-[#44474f]">• Kode antrean otomatis</span>
          </div>

          <div>
            <label className="patient-modal__label">Pasien <span>*</span></label>
            <input className="patient-modal__input" placeholder="Nama lengkap pasien" {...register('pasien')} />
            {errors.pasien && <p className="patient-modal__error">{errors.pasien.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="patient-modal__label">Dokter <span>*</span></label>
              <select className="patient-modal__input" {...register('dokter')}>
                {dokterOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.dokter && <p className="patient-modal__error">{errors.dokter.message}</p>}
            </div>
            <div>
              <label className="patient-modal__label">Poli <span>*</span></label>
              <select className="patient-modal__input" {...register('poli')}>
                {poliOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.poli && <p className="patient-modal__error">{errors.poli.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="patient-modal__label">Tanggal Kunjungan <span>*</span></label>
              <input className="patient-modal__input" type="date" {...register('tanggalKunjungan')} />
              {errors.tanggalKunjungan && <p className="patient-modal__error">{errors.tanggalKunjungan.message}</p>}
            </div>
            <div>
              <label className="patient-modal__label">Jenis Pembayaran <span>*</span></label>
              <select className="patient-modal__input" {...register('jenisPembayaran')}>
                <option value="BPJS">BPJS</option>
                <option value="UMUM">UMUM</option>
                <option value="ASURANSI">ASURANSI</option>
              </select>
              {errors.jenisPembayaran && <p className="patient-modal__error">{errors.jenisPembayaran.message}</p>}
            </div>
          </div>

          <div>
            <label className="patient-modal__label">Keluhan Awal <span>*</span></label>
            <textarea className="patient-modal__input" placeholder="Jelaskan keluhan awal pasien..." rows={3} {...register('keluhanAwal')} />
            {errors.keluhanAwal && <p className="patient-modal__error">{errors.keluhanAwal.message}</p>}
          </div>

          <div className="pt-2 border-t border-[#c4c6d0]/20">
            <p className="text-xs font-bold text-[#001637] mb-3">Tanda Vital</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="patient-modal__label">TD (mmHg)</label>
                <input className="patient-modal__input" placeholder="120/80" {...register('td')} />
              </div>
              <div>
                <label className="patient-modal__label">Nadi (x/menit)</label>
                <input className="patient-modal__input" type="number" placeholder="80" {...register('nadi')} />
              </div>
              <div>
                <label className="patient-modal__label">Suhu (°C)</label>
                <input className="patient-modal__input" type="number" step="0.1" placeholder="36.5" {...register('suhu')} />
              </div>
              <div>
                <label className="patient-modal__label">BB (kg)</label>
                <input className="patient-modal__input" type="number" step="0.1" placeholder="65" {...register('bb')} />
              </div>
              <div>
                <label className="patient-modal__label">TB (cm)</label>
                <input className="patient-modal__input" type="number" step="0.1" placeholder="170" {...register('tb')} />
              </div>
            </div>
          </div>

          {serverError && <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-xs text-[#93000a]">{serverError}</div>}
        </form>

        <div className="patient-modal__footer">
          <button type="button" className="patient-modal__btn-secondary" onClick={onClose}>Batal</button>
          <button type="button" className="patient-modal__btn-primary" onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
            {isSubmitting ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Menyimpan...</> : <><span className="material-symbols-outlined text-sm">how_to_reg</span> Simpan Pasien Baru</>}
          </button>
        </div>
      </div>
    </div>
  )
}
