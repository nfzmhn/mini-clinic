import { z } from 'zod'
import prisma from '../config/prisma.js'
import { success, failure } from '../utils/response.js'

const schema = z.object({ name: z.string().min(2), code: z.string().min(1).max(2) })

export const list = async (req, res) => {
  const data = await prisma.poli.findMany({ orderBy: { id: 'asc' } })
  return success(res, data)
}

export const create = async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const poli = await prisma.poli.create({ data: parsed.data })
  return success(res, poli, 'Created', 201)
}

export const update = async (req, res) => {
  const parsed = schema.partial().safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const poli = await prisma.poli.update({ where: { id: Number(req.params.id) }, data: parsed.data }).catch(() => null)
  if (!poli) return failure(res, 'Not found', 404)
  return success(res, poli)
}

export const remove = async (req, res) => {
  await prisma.poli.delete({ where: { id: Number(req.params.id) } }).catch(() => null)
  return success(res, null, 'Deleted')
}
