import { z } from 'zod'
import prisma from '../config/prisma.js'
import { success, failure } from '../utils/response.js'

const schema = z.object({
  nik: z.string().length(16),
  name: z.string().min(2),
  gender: z.enum(['L', 'P']),
  birthDate: z.string().or(z.date()).transform(v => new Date(v)),
  phone: z.string().min(8),
  address: z.string().min(3),
})

export const list = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query
  const where = q ? { OR: [{ nik: { contains: q } }, { mrn: { contains: q } }, { name: { contains: q } }] } : {}
  const [data, total] = await Promise.all([
    prisma.patient.findMany({ where, skip: (Number(page) - 1) * Number(limit), take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.patient.count({ where }),
  ])
  return success(res, { data, total, page: Number(page), limit: Number(limit) })
}

export const getOne = async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { id: Number(req.params.id) } })
  if (!patient) return failure(res, 'Not found', 404)
  return success(res, patient)
}

export const create = async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const count = await prisma.patient.count()
  const mrn = `RM-${String(count + 1).padStart(4, '0')}`
  try {
    const patient = await prisma.patient.create({ data: { mrn, ...parsed.data } })
    return success(res, patient, 'Created', 201)
  } catch (e) {
    return failure(res, e.message, 400)
  }
}

export const update = async (req, res) => {
  const parsed = schema.partial().safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const patient = await prisma.patient.update({ where: { id: Number(req.params.id) }, data: parsed.data }).catch(() => null)
  if (!patient) return failure(res, 'Not found', 404)
  return success(res, patient)
}

export const remove = async (req, res) => {
  await prisma.patient.delete({ where: { id: Number(req.params.id) } }).catch(() => null)
  return success(res, null, 'Deleted')
}
