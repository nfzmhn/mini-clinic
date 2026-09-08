import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.medicalAction.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.user.deleteMany()
  await prisma.poli.deleteMany()

  const poliUmum = await prisma.poli.create({ data: { name: 'Poli Umum', code: 'A' } })
  const poliGigi = await prisma.poli.create({ data: { name: 'Poli Gigi & Mulut', code: 'B' } })
  const poliAnak = await prisma.poli.create({ data: { name: 'Poli Anak', code: 'C' } })

  const salt = await bcrypt.genSalt(10)
  const hashAdmin = await bcrypt.hash('admin123', salt)
  const hashDoctor = await bcrypt.hash('dokter123', salt)
  const hashOfficer = await bcrypt.hash('petugas123', salt)

  await prisma.user.create({ data: { username: 'admin', passwordHash: hashAdmin, role: 'ADMIN' } })
  const doctor = await prisma.user.create({ data: { username: 'dokter', passwordHash: hashDoctor, role: 'DOCTOR', poliId: poliUmum.id } })
  await prisma.user.create({ data: { username: 'petugas', passwordHash: hashOfficer, role: 'REGISTRATION_OFFICER' } })

  const patient = await prisma.patient.create({
    data: {
      mrn: 'RM-0001',
      nik: '3271021405900003',
      name: 'Budi Pratama',
      gender: 'L',
      birthDate: new Date('1990-05-14'),
      phone: '081289214320',
      address: 'Jl. Dipati Ukur No. 45, Bandung',
    },
  })

  await prisma.registration.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      poliId: poliUmum.id,
      paymentType: 'BPJS',
      complaint: 'Demam naik turun sejak 3 hari',
      status: 'CheckIn',
      queueNumber: 'A001',
    },
  })

  console.log('Database seeded successfully.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
