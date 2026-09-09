import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as c from '../controllers/registrationController.js'

/**
 * /api/queues — alias semantik untuk antrian berbasis Registration
 *
 * GET  /queues                → list registrasi status Menunggu/CheckIn
 * POST /queues                → buat registrasi baru (sekaligus masuk antrian)
 * PUT  /queues/:id/call       → panggil pasien ini (status → CheckIn)
 * PUT  /queues/:id/status     → ubah status antrian secara manual
 */
const r = Router()
r.use(authenticate)

// GET /queues — default tampilkan Menunggu & CheckIn
r.get('/', async (req, res) => {
  const { status, poliId, doctorId, date } = req.query
  const where = {}
  // Default tampilkan antrian aktif jika status tidak dispecify
  if (status) where.status = status
  else where.status = { in: ['Menunggu', 'CheckIn'] }
  if (poliId) where.poliId = Number(poliId)
  if (doctorId) where.doctorId = Number(doctorId)
  if (date) {
    const d = new Date(date)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.visitDate = { gte: d, lt: next }
  }
  const { default: prisma } = await import('../config/prisma.js')
  const { success } = await import('../utils/response.js')
  const data = await prisma.registration.findMany({
    where,
    include: { patient: true, doctor: { select: { id: true, username: true } }, poli: true },
    orderBy: { createdAt: 'asc' },
  })
  return success(res, data)
})

// POST /queues — sama dengan POST /registrations
r.post('/', c.create)

// PUT /queues/:id/call — panggil pasien (Menunggu → CheckIn)
r.put('/:id/call', async (req, res) => {
  const id = Number(req.params.id)
  const { default: prisma } = await import('../config/prisma.js')
  const { success, failure } = await import('../utils/response.js')
  const reg = await prisma.registration.update({
    where: { id },
    data: { status: 'CheckIn' },
    include: { patient: true, poli: true, doctor: { select: { id: true, username: true } } },
  }).catch(() => null)
  if (!reg) return failure(res, 'Antrian tidak ditemukan', 404)
  return success(res, reg, 'Pasien dipanggil — status CheckIn')
})

// PUT /queues/:id/status — ubah status bebas
r.put('/:id/status', c.updateStatus)

export default r
