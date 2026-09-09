import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Membersihkan database lama...')
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.medicalAction.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.poli.deleteMany()

  // ─── POLI ───────────────────────────────────────────────────────────────────
  console.log('🏥 Seeding poli...')
  const poliUmum  = await prisma.poli.create({ data: { name: 'Poli Umum',       code: 'A' } })
  const poliGigi  = await prisma.poli.create({ data: { name: 'Poli Gigi & Mulut', code: 'B' } })
  const poliAnak  = await prisma.poli.create({ data: { name: 'Poli Anak',        code: 'C' } })
  const poliMata  = await prisma.poli.create({ data: { name: 'Poli Mata',        code: 'D' } })

  // ─── USERS ──────────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...')
  const salt = await bcrypt.genSalt(10)

  const admin = await prisma.user.create({
    data: { username: 'admin', passwordHash: await bcrypt.hash('admin123', salt), role: 'ADMIN' }
  })
  const dokterUmum = await prisma.user.create({
    data: { username: 'dr. Andi Wijaya', passwordHash: await bcrypt.hash('dokter123', salt), role: 'DOCTOR', poliId: poliUmum.id }
  })
  const dokterGigi = await prisma.user.create({
    data: { username: 'drg. Sari Dewi', passwordHash: await bcrypt.hash('dokter456', salt), role: 'DOCTOR', poliId: poliGigi.id }
  })
  const dokterAnak = await prisma.user.create({
    data: { username: 'dr. Hendra Sp.A', passwordHash: await bcrypt.hash('dokter789', salt), role: 'DOCTOR', poliId: poliAnak.id }
  })
  await prisma.user.create({
    data: { username: 'petugas', passwordHash: await bcrypt.hash('petugas123', salt), role: 'REGISTRATION_OFFICER' }
  })

  // ─── PATIENTS ────────────────────────────────────────────────────────────────
  console.log('🧑‍⚕️ Seeding pasien...')
  const patients = await Promise.all([
    prisma.patient.create({ data: { mrn: 'RM-0001', nik: '3271021405900001', name: 'Budi Pratama',       gender: 'L', birthDate: new Date('1990-05-14'), phone: '081289214320', address: 'Jl. Dipati Ukur No. 45, Bandung' } }),
    prisma.patient.create({ data: { mrn: 'RM-0002', nik: '3271056706850002', name: 'Siti Rahayu',        gender: 'P', birthDate: new Date('1985-06-27'), phone: '082345678901', address: 'Jl. Merdeka No. 12, Jakarta Pusat' } }),
    prisma.patient.create({ data: { mrn: 'RM-0003', nik: '3273081209920003', name: 'Ahmad Fauzan',       gender: 'L', birthDate: new Date('1992-09-12'), phone: '083456789012', address: 'Jl. Sudirman Kav. 5, Jakarta Selatan' } }),
    prisma.patient.create({ data: { mrn: 'RM-0004', nik: '3275042803750004', name: 'Dewi Anggraini',     gender: 'P', birthDate: new Date('1975-03-28'), phone: '084567890123', address: 'Jl. Gatot Subroto No. 33, Bandung' } }),
    prisma.patient.create({ data: { mrn: 'RM-0005', nik: '3276051507800005', name: 'Rendi Kusuma',       gender: 'L', birthDate: new Date('1980-07-15'), phone: '085678901234', address: 'Perum. Griya Indah Blok B No. 7, Depok' } }),
    prisma.patient.create({ data: { mrn: 'RM-0006', nik: '3271092210010006', name: 'Nayla Putri',        gender: 'P', birthDate: new Date('2001-10-22'), phone: '086789012345', address: 'Jl. Kebon Jeruk Raya No. 88, Jakarta Barat' } }),
    prisma.patient.create({ data: { mrn: 'RM-0007', nik: '3272030405950007', name: 'Hasan Basri',        gender: 'L', birthDate: new Date('1995-04-04'), phone: '087890123456', address: 'Komp. Bukit Mas No. 15, Surabaya' } }),
    prisma.patient.create({ data: { mrn: 'RM-0008', nik: '3274110611680008', name: 'Rina Marlina',       gender: 'P', birthDate: new Date('1968-11-06'), phone: '088901234567', address: 'Jl. Ahmad Yani No. 200, Bekasi' } }),
    prisma.patient.create({ data: { mrn: 'RM-0009', nik: '3270070107830009', name: 'Doni Setiawan',      gender: 'L', birthDate: new Date('1983-07-01'), phone: '089012345678', address: 'Jl. Raya Bogor Km. 25, Depok' } }),
    prisma.patient.create({ data: { mrn: 'RM-0010', nik: '3278020209720010', name: 'Fitri Handayani',    gender: 'P', birthDate: new Date('1972-02-02'), phone: '081123456789', address: 'Jl. Pramuka No. 5, Jakarta Timur' } }),
  ])

  const [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10] = patients

  // ─── REGISTRATIONS ───────────────────────────────────────────────────────────
  console.log('📋 Seeding registrasi...')
  const today = new Date(); today.setHours(0, 0, 0, 0)

  // Registrasi hari ini — berbagai status
  const reg1 = await prisma.registration.create({ data: { patientId: p1.id, doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'BPJS',    complaint: 'Demam naik turun sejak 3 hari, disertai nyeri kepala', queueNumber: 'A-0001', status: 'Selesai',    visitDate: today } })
  const reg2 = await prisma.registration.create({ data: { patientId: p2.id, doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'UMUM',    complaint: 'Batuk berdahak dan sesak napas ringan',                queueNumber: 'A-0002', status: 'Selesai',    visitDate: today } })
  const reg3 = await prisma.registration.create({ data: { patientId: p3.id, doctorId: dokterGigi.id, poliId: poliGigi.id, paymentType: 'ASURANSI', complaint: 'Sakit gigi geraham kanan bawah, sudah 5 hari',          queueNumber: 'B-0001', status: 'CheckIn',    visitDate: today } })
  const reg4 = await prisma.registration.create({ data: { patientId: p4.id, doctorId: dokterAnak.id, poliId: poliAnak.id, paymentType: 'BPJS',    complaint: 'Anak susah makan dan berat badan turun',               queueNumber: 'C-0001', status: 'Menunggu',   visitDate: today } })
  const reg5 = await prisma.registration.create({ data: { patientId: p5.id, doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'UMUM',    complaint: 'Nyeri pinggang kiri sejak seminggu lalu',               queueNumber: 'A-0003', status: 'Menunggu',   visitDate: today } })
  const reg6 = await prisma.registration.create({ data: { patientId: p6.id, doctorId: dokterGigi.id, poliId: poliGigi.id, paymentType: 'UMUM',    complaint: 'Gusi bengkak dan berdarah saat sikat gigi',            queueNumber: 'B-0002', status: 'Menunggu',   visitDate: today } })
  const reg7 = await prisma.registration.create({ data: { patientId: p7.id, doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'BPJS',    complaint: 'Kontrol hipertensi rutin',                              queueNumber: 'A-0004', status: 'Menunggu',   visitDate: today } })

  // Registrasi kemarin — sudah selesai semua (untuk riwayat rekam medis)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const reg8  = await prisma.registration.create({ data: { patientId: p8.id,  doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'BPJS',    complaint: 'Pusing berputar dan mual',                   queueNumber: 'A-0001', status: 'Selesai', visitDate: yesterday } })
  const reg9  = await prisma.registration.create({ data: { patientId: p9.id,  doctorId: dokterGigi.id, poliId: poliGigi.id, paymentType: 'UMUM',    complaint: 'Gigi berlubang, ingin dicabut',               queueNumber: 'B-0001', status: 'Selesai', visitDate: yesterday } })
  const reg10 = await prisma.registration.create({ data: { patientId: p10.id, doctorId: dokterAnak.id, poliId: poliAnak.id, paymentType: 'ASURANSI', complaint: 'Demam pada anak usia 2 tahun',                queueNumber: 'C-0001', status: 'Selesai', visitDate: yesterday } })
  // Kunjungan kedua p1 kemarin
  const reg11 = await prisma.registration.create({ data: { patientId: p1.id, doctorId: dokterUmum.id, poliId: poliUmum.id, paymentType: 'BPJS',    complaint: 'Kontrol setelah demam berdarah',              queueNumber: 'A-0002', status: 'Selesai', visitDate: yesterday } })

  // ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────
  console.log('📄 Seeding rekam medis...')

  // RekMed 1 — reg1 (Budi, hari ini, Selesai)
  const mr1 = await prisma.medicalRecord.create({
    data: {
      registrationId: reg1.id,
      patientId:      p1.id,
      doctorId:       dokterUmum.id,
      subjective:     'Pasien mengeluh demam naik turun sejak 3 hari. Nyeri kepala, lemas, dan nafsu makan menurun. Tidak ada batuk atau pilek.',
      objective:      'KU: Tampak lemah. Kesadaran composmentis. Konjungtiva tidak anemis.',
      bp:             '110/70',
      temp:           38.7,
      weight:         68,
      height:         170,
      diagnosis:      'A90 • Dengue Fever tanpa tanda bahaya',
      therapy:        'Bed rest. Minum air putih minimal 2L/hari. Paracetamol 500mg jika demam > 38.5°C.',
      actions: { create: [
        { name: 'Pemeriksaan Darah Lengkap (DL)', cost: 0 },
        { name: 'Rapid Test NS1 Antigen Dengue',  cost: 0 },
      ]},
      prescription: { create: {
        notes: 'Ambil di apotek besok pagi jika stok habis hari ini.',
        items: { create: [
          { medicine: 'Paracetamol 500mg',   dosage: '3x1 tab', qty: 15, instruction: 'Diminum setelah makan bila demam' },
          { medicine: 'Oralit Sachet',       dosage: '3x1 sach', qty: 9, instruction: 'Larutkan dalam 200ml air, minum perlahan' },
          { medicine: 'Vitamin C 500mg',     dosage: '1x1 tab', qty: 7,  instruction: 'Diminum setelah sarapan' },
        ]}
      }}
    }
  })

  // RekMed 2 — reg2 (Siti, hari ini, Selesai)
  const mr2 = await prisma.medicalRecord.create({
    data: {
      registrationId: reg2.id,
      patientId:      p2.id,
      doctorId:       dokterUmum.id,
      subjective:     'Batuk berdahak warna putih kekuningan sejak 5 hari. Sesak napas ringan saat beraktivitas. Riwayat alergi debu.',
      objective:      'Auskultasi paru: ronki basah halus di basal kanan. SpO2 97%.',
      bp:             '120/80',
      temp:           37.3,
      weight:         55,
      height:         158,
      diagnosis:      'J06.9 • Infeksi Saluran Pernapasan Atas Akut (ISPA)',
      therapy:        'Nebulisasi salbutamol 1x. Minum air hangat. Hindari paparan asap.',
      actions: { create: [
        { name: 'Nebulisasi Salbutamol 2.5mg', cost: 0 },
      ]},
      prescription: { create: {
        notes: '',
        items: { create: [
          { medicine: 'Ambroxol 30mg',        dosage: '3x1 tab', qty: 15, instruction: 'Setelah makan' },
          { medicine: 'Cetirizine 10mg',      dosage: '1x1 tab', qty: 5,  instruction: 'Malam hari sebelum tidur' },
          { medicine: 'Erdostein 300mg',      dosage: '2x1 tab', qty: 10, instruction: 'Setelah makan pagi dan sore' },
        ]}
      }}
    }
  })

  // RekMed 3 — reg8 (Rina, kemarin, Selesai)
  const mr3 = await prisma.medicalRecord.create({
    data: {
      registrationId: reg8.id,
      patientId:      p8.id,
      doctorId:       dokterUmum.id,
      subjective:     'Pusing berputar (vertigo) tiba-tiba saat bangun tidur. Mual dan muntah 2x. Tidak ada gangguan pendengaran.',
      objective:      'TD 130/85, nadi 88x/mnt. Nystagmus horizontal saat manuver Dix-Hallpike positif.',
      bp:             '130/85',
      temp:           36.8,
      weight:         62,
      height:         155,
      diagnosis:      'H81.1 • Benign Paroxysmal Positional Vertigo (BPPV)',
      therapy:        'Manuver Epley dilakukan. Bed rest 24 jam. Posisi tidur kepala sedikit ditinggikan.',
      actions: { create: [
        { name: 'Manuver Epley', cost: 0 },
      ]},
      prescription: { create: {
        notes: 'Kontrol ulang 3 hari jika gejala tidak membaik.',
        items: { create: [
          { medicine: 'Betahistine 24mg',  dosage: '2x1 tab', qty: 14, instruction: 'Setelah makan' },
          { medicine: 'Ondansetron 4mg',   dosage: '3x1 tab', qty: 9,  instruction: 'Jika mual, telan perlahan' },
          { medicine: 'Dimenhydrinate 50mg', dosage: '2x1 tab', qty: 6, instruction: 'Bila vertigo kambuh' },
        ]}
      }}
    }
  })

  // RekMed 4 — reg9 (Doni, kemarin, Selesai) — rekam medis gigi
  const mr4 = await prisma.medicalRecord.create({
    data: {
      registrationId: reg9.id,
      patientId:      p9.id,
      doctorId:       dokterGigi.id,
      subjective:     'Gigi geraham kiri bawah (36) nyeri berdenyut sejak 1 minggu. Pernah diobati sendiri dengan asam mefenamat. Minta dicabut.',
      objective:      'Gigi 36: karies profunda dengan sisa mahkota. Perkusi (+), tekan (+). Abses periapikal radiolusen tampak pada rontgen.',
      bp:             '125/82',
      temp:           36.5,
      diagnosis:      'K04.7 • Abses Periapikal Gigi 36',
      therapy:        'Ekstraksi gigi 36 dilakukan dengan anestesi lokal lidokain 2%. Perdarahan terkontrol. Tampon gigit 30 menit.',
      actions: { create: [
        { name: 'Ekstraksi Gigi Permanen', cost: 0 },
        { name: 'Rontgen Dental Periapikal', cost: 0 },
      ]},
      prescription: { create: {
        notes: 'Jangan kumur keras 24 jam. Hindari makan panas/pedas.',
        items: { create: [
          { medicine: 'Amoxicillin 500mg',      dosage: '3x1 tab', qty: 15, instruction: 'Habiskan! Minum setelah makan' },
          { medicine: 'Asam Mefenamat 500mg',   dosage: '3x1 tab', qty: 9,  instruction: 'Bila nyeri, setelah makan' },
          { medicine: 'Betadine Kumur 190ml',   dosage: '3x/hari', qty: 1,  instruction: 'Kumur 30 detik, jangan ditelan' },
        ]}
      }}
    }
  })

  // RekMed 5 — reg10 (Fitri, kemarin, Selesai) — rekam medis anak
  const mr5 = await prisma.medicalRecord.create({
    data: {
      registrationId: reg10.id,
      patientId:      p10.id,
      doctorId:       dokterAnak.id,
      subjective:     'Demam 3 hari, suhu tertinggi 39.2°C. Anak rewel, mau minum tapi susah makan. Tidak ada kejang.',
      objective:      'Suhu aksila 38.9°C. Faring hiperemis (+). Tonsil T1-T1. KGB servikal teraba 1 buah.',
      bp:             null,
      temp:           38.9,
      weight:         12,
      height:         88,
      diagnosis:      'J02.9 • Faringitis Akut',
      therapy:        'Kompres hangat. Berikan cairan cukup. Ibuprofen syrup bila demam.',
      actions: { create: [] },
      prescription: { create: {
        notes: 'Dosis disesuaikan BB anak 12 kg. Kontrol 3 hari atau segera jika demam >40°C.',
        items: { create: [
          { medicine: 'Ibuprofen Syrup 100mg/5ml', dosage: '3x3ml', qty: 1,  instruction: 'Bila demam >38°C, kocok sebelum digunakan' },
          { medicine: 'Amoxicillin Syrup 125mg/5ml', dosage: '3x5ml', qty: 2, instruction: 'Habiskan, minum setelah makan' },
          { medicine: 'Zinc Syrup 20mg/5ml',       dosage: '1x5ml', qty: 1,  instruction: 'Sekali sehari, pagi hari' },
        ]}
      }}
    }
  })

  // RekMed 6 — reg11 (Budi kunjungan ke-2 kemarin)
  await prisma.medicalRecord.create({
    data: {
      registrationId: reg11.id,
      patientId:      p1.id,
      doctorId:       dokterUmum.id,
      subjective:     'Kontrol hari ke-5 pasca Dengue Fever. Demam sudah turun 2 hari lalu. Nafsu makan mulai membaik. Masih lemas.',
      objective:      'TD 115/75. Suhu 36.9°C. Trombosit hasil DL hari ini: 158.000/μL (naik dari 78.000).',
      bp:             '115/75',
      temp:           36.9,
      weight:         68,
      height:         170,
      diagnosis:      'A90 • Dengue Fever — fase recovery',
      therapy:        'Lanjutkan minum air putih banyak. Vitamin C dilanjutkan 3 hari lagi. Aktivitas ringan dulu.',
      actions: { create: [
        { name: 'Pemeriksaan Darah Lengkap (kontrol)', cost: 0 },
      ]},
      prescription: { create: {
        notes: '',
        items: { create: [
          { medicine: 'Vitamin C 500mg',   dosage: '1x1 tab', qty: 3,  instruction: 'Setelah makan pagi' },
          { medicine: 'Multivitamin Tablet', dosage: '1x1 tab', qty: 7, instruction: 'Setelah makan' },
        ]}
      }}
    }
  })

  console.log('\n✅ Database berhasil di-seed!\n')
  console.log('═══════════════════════════════════════════════════════')
  console.log('🔑 AKUN LOGIN:')
  console.log('   admin   / admin123   → ADMIN')
  console.log('   petugas / petugas123 → REGISTRATION_OFFICER')
  console.log('   [Dokter login gunakan username di bawah]')
  console.log('')
  console.log('👨‍⚕️ AKUN DOKTER:')
  console.log(`   Username: "dr. Andi Wijaya"  | password: dokter123  | Poli Umum  | ID: ${dokterUmum.id}`)
  console.log(`   Username: "drg. Sari Dewi"   | password: dokter456  | Poli Gigi  | ID: ${dokterGigi.id}`)
  console.log(`   Username: "dr. Hendra Sp.A"  | password: dokter789  | Poli Anak  | ID: ${dokterAnak.id}`)
  console.log('')
  console.log('🏥 POLI:')
  console.log(`   Poli Umum (A)       — ID: ${poliUmum.id}`)
  console.log(`   Poli Gigi & Mulut (B) — ID: ${poliGigi.id}`)
  console.log(`   Poli Anak (C)       — ID: ${poliAnak.id}`)
  console.log(`   Poli Mata (D)       — ID: ${poliMata.id}`)
  console.log('')
  console.log('🧑 PASIEN (10 pasien, ID 1-10):')
  patients.forEach((p, i) => console.log(`   ID ${p.id} — ${p.mrn} — ${p.name}`))
  console.log('')
  console.log('📋 REGISTRASI HARI INI (7 data):')
  console.log(`   ID ${reg1.id} — A-0001 — Budi Pratama      — SELESAI   (ada rekam medis + resep)`)
  console.log(`   ID ${reg2.id} — A-0002 — Siti Rahayu       — SELESAI   (ada rekam medis + resep)`)
  console.log(`   ID ${reg3.id} — B-0001 — Ahmad Fauzan      — CHECKIN   (antrian aktif)`)
  console.log(`   ID ${reg4.id} — C-0001 — Dewi Anggraini    — MENUNGGU  (antrian aktif)`)
  console.log(`   ID ${reg5.id} — A-0003 — Rendi Kusuma      — MENUNGGU  (antrian aktif)`)
  console.log(`   ID ${reg6.id} — B-0002 — Nayla Putri       — MENUNGGU  (antrian aktif)`)
  console.log(`   ID ${reg7.id} — A-0004 — Hasan Basri       — MENUNGGU  (antrian aktif)`)
  console.log('')
  console.log('📋 REGISTRASI KEMARIN (4 data, semua Selesai):')
  console.log(`   ID ${reg8.id}  — Rina Marlina (vertigo)`)
  console.log(`   ID ${reg9.id}  — Doni Setiawan (cabut gigi)`)
  console.log(`   ID ${reg10.id} — Fitri Handayani (anak demam)`)
  console.log(`   ID ${reg11.id} — Budi Pratama (kontrol ke-2)`)
  console.log('')
  console.log('📄 REKAM MEDIS: 6 rekam medis dengan resep lengkap')
  console.log('═══════════════════════════════════════════════════════')
}

main()
  .catch(e => { console.error('❌ Seed gagal:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
