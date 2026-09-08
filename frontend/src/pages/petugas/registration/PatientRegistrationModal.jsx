import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { getPolis } from '../../../services/poli'
import { getUsers } from '../../../services/user'
import './PatientRegistrationModal.css'

const registrationSchema = z.object({
  pasien: z.string().min(3, 'Nama pasien wajib diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  address: z.string().min(5, 'Alamat wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['L', 'P']),
  phone: z.string().min(8, 'No. Telepon tidak valid'),
  doctorId: z.string().min(1, 'Dokter wajib dipilih'),
  poliId: z.string().min(1, 'Poli wajib dipilih'),
  tanggalKunjungan: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
  jenisPembayaran: z.enum(['BPJS', 'UMUM', 'ASURANSI']),
  keluhanAwal: z.string().min(5, 'Keluhan awal wajib diisi'),
})

const patientOnlySchema = z.object({
  pasien: z.string().min(3, 'Nama pasien wajib diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit'),
  address: z.string().min(5, 'Alamat wajib diisi'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['L', 'P']),
  phone: z.string().min(8, 'No. Telepon tidak valid'),
})

export default function PatientRegistrationModal({ isOpen, onClose, onSubmit, patientOnly = false }) {
  const [serverError, setServerError] = useState('')

  // Load polis and doctors from API
  const { data: polisData } = useQuery({
    queryKey: ['polis-modal'],
    queryFn: async () => {
      const res = await getPolis()
      return Array.isArray(res) ? res : (res?.data || [])
    },
    enabled: isOpen && !patientOnly,
  })

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-modal'],
    queryFn: async () => {
      const res = await getUsers({ role: 'DOCTOR' })
      return Array.isArray(res) ? res : (res?.data || [])
    },
    enabled: isOpen && !patientOnly,
  })

  const polis = Array.isArray(polisData) ? polisData : []
  const doctors = Array.isArray(doctorsData) ? doctorsData : []

  const schema = patientOnly ? patientOnlySchema : registrationSchema

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      jenisPembayaran: 'BPJS',
      tanggalKunjungan: new Date().toISOString().slice(0, 10),
      gender: 'L',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        pasien: '', nik: '', address: '', birthDate: '', gender: 'L', phone: '',
        doctorId: '', poliId: '',
        tanggalKunjungan: new Date().toISOString().slice(0, 10),
        jenisPembayaran: 'BPJS', keluhanAwal: '',
      })
      setServerError('')
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  const onFormSubmit = async (data) => {
    setServerError('')
    try {
      if (patientOnly) {
        await onSubmit({
          pasien: data.pasien,
          name: data.pasien,
          nik: data.nik,
          gender: data.gender,
          birthDate: data.birthDate,
          phone: data.phone,
          address: data.address,
        })
      } else {
        const selectedPoli = polis.find(p => p.id === Number(data.poliId))
        await onSubmit({
          name: data.pasien,
          nik: data.nik,
          gender: data.gender,
          birthDate: data.birthDate,
          phone: data.phone,
          address: data.address,
          doctorId: Number(data.doctorId),
          poliId: Number(data.poliId),
          poli: selectedPoli?.name || '',
          paymentType: data.jenisPembayaran,
          keluhanAwal: data.keluhanAwal,
        })
      }
      reset()
      onClose()
    } catch (e) {
      setServerError(e.response?.data?.message || e.message || 'Gagal menyimpan data')
    }
  }

  return (
    <div className="patient-modal__overlay" onClick={onClose}>
      <div className="patient-modal__card" onClick={e => e.stopPropagation()}>
        <div className="patient-modal__header">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#001637]">
                {patientOnly ? 'Tambah Data Pasien' : 'Pendaftaran Pasien Baru'}
              </span>
            </div>
            <p className="text-xs text-[#44474f]">
              {patientOnly ? 'Tambahkan data identitas pasien baru ke database.' : 'Daftarkan pasien ke antrian poli.'}
            </p>
          </div>
          <button type="button" className="p-2 rounded-lg hover:bg-[#dce9ff] text-[#44474f]" onClick={onClose}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="patient-modal__body" noValidate>
          {/* Data Pasien */}
          <div>
            <label className="patient-modal__label">Nama Pasien <span>*</span></label>
            <input className="patient-modal__input" placeholder="Nama lengkap pasien" {...register('pasien')} />
            {errors.pasien && <p className="patient-modal__error">{errors.pasien.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="patient-modal__label">NIK (16 Digit) <span>*</span></label>
              <input className="patient-modal__input font-mono" maxLength={16} placeholder="3271021405900003" {...register('nik')} />
              {errors.nik && <p className="patient-modal__error">{errors.nik.message}</p>}
            </div>
            <div>
              <label className="patient-modal__label">No. Telepon <span>*</span></label>
              <input className="patient-modal__input" placeholder="0812..." {...register('phone')} />
              {errors.phone && <p className="patient-modal__error">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="patient-modal__label">Gender <span>*</span></label>
              <select className="patient-modal__input" {...register('gender')}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="patient-modal__label">Tanggal Lahir <span>*</span></label>
              <input className="patient-modal__input" type="date" {...register('birthDate')} />
              {errors.birthDate && <p className="patient-modal__error">{errors.birthDate.message}</p>}
            </div>
          </div>

          <div>
            <label className="patient-modal__label">Alamat <span>*</span></label>
            <input className="patient-modal__input" placeholder="Alamat sesuai KTP" {...register('address')} />
            {errors.address && <p className="patient-modal__error">{errors.address.message}</p>}
          </div>

          {/* Registration fields — only shown if NOT patientOnly */}
          {!patientOnly && (
            <>
              <div className="pt-2 border-t border-[#c4c6d0]/20">
                <p className="text-xs font-bold text-[#001637] mb-3">Data Pendaftaran</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="patient-modal__label">Dokter <span>*</span></label>
                  <select className="patient-modal__input" {...register('doctorId')}>
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.username}</option>
                    ))}
                  </select>
                  {errors.doctorId && <p className="patient-modal__error">{errors.doctorId.message}</p>}
                </div>
                <div>
                  <label className="patient-modal__label">Poli <span>*</span></label>
                  <select className="patient-modal__input" {...register('poliId')}>
                    <option value="">-- Pilih Poli --</option>
                    {polis.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.poliId && <p className="patient-modal__error">{errors.poliId.message}</p>}
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
                </div>
              </div>

              <div>
                <label className="patient-modal__label">Keluhan Awal <span>*</span></label>
                <textarea className="patient-modal__input" placeholder="Jelaskan keluhan awal pasien..." rows={3} {...register('keluhanAwal')} />
                {errors.keluhanAwal && <p className="patient-modal__error">{errors.keluhanAwal.message}</p>}
              </div>
            </>
          )}

          {serverError && <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-xs text-[#93000a]">{serverError}</div>}
        </form>

        <div className="patient-modal__footer">
          <button type="button" className="patient-modal__btn-secondary" onClick={onClose}>Batal</button>
          <button type="button" className="patient-modal__btn-primary" onClick={handleSubmit(onFormSubmit)} disabled={isSubmitting}>
            {isSubmitting
              ? <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Menyimpan...</>
              : <><span className="material-symbols-outlined text-sm">how_to_reg</span> {patientOnly ? 'Simpan Pasien' : 'Daftarkan Pasien'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
