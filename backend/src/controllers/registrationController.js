import { z } from 'zod'
import prisma from '../config/prisma.js'
import { success, failure } from '../utils/response.js'

const schema = z.object({
  patientId: z.number(),
  doctorId: z.number(),
  poliId: z.number(),
  paymentType: z.enum(['BPJS', 'UMUM', 'ASURANSI']),
  complaint: z.string().min(1),
})

export const list = async (req, res) => {
  const { status, poliId, doctorId, date } = req.query
  const where = {}
  if (status) where.status = status
  if (poliId) where.poliId = Number(poliId)
  if (doctorId) where.doctorId = Number(doctorId)
  if (date) {
    const d = new Date(date)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.visitDate = { gte: d, lt: next }
  }
  const data = await prisma.registration.findMany({ where, include: { patient: true, doctor: true, poli: true }, orderBy: { createdAt: 'desc' } })
  return success(res, data)
}

export const getOne = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return failure(res, 'ID tidak valid', 400)
  const data = await prisma.registration.findUnique({
    where: { id },
    include: { patient: true, doctor: { select: { id: true, username: true, role: true } }, poli: true },
  })
  if (!data) return failure(res, 'Registration tidak ditemukan', 404)
  return success(res, data)
}

export const create = async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const poli = await prisma.poli.findUnique({ where: { id: parsed.data.poliId } })
  if (!poli) return failure(res, 'Poli not found', 404)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const count = await prisma.registration.count({ where: { poliId: parsed.data.poliId, visitDate: { gte: today, lt: tomorrow } } })
  const queueNumber = `${poli.code}-${String(count + 1).padStart(4, '0')}`
  const reg = await prisma.registration.create({ data: { ...parsed.data, queueNumber, visitDate: new Date() } })
  return success(res, reg, 'Created', 201)
}

export const updateStatus = async (req, res) => {
  const { status } = req.body
  const reg = await prisma.registration.update({ where: { id: Number(req.params.id) }, data: { status } }).catch(() => null)
  if (!reg) return failure(res, 'Not found', 404)
  return success(res, reg)
}

export const callNext = async (req, res) => {
  const { poliId } = req.query
  const next = await prisma.registration.findFirst({ where: { status: 'Menunggu', ...(poliId && { poliId: Number(poliId) }) }, orderBy: { createdAt: 'asc' } })
  if (!next) return failure(res, 'No queue', 404)
  const updated = await prisma.registration.update({ where: { id: next.id }, data: { status: 'CheckIn' } })
  return success(res, updated)
}
