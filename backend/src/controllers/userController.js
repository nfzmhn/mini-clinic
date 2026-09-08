import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { z } from 'zod'
import { success, failure } from '../utils/response.js'

const createSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER']),
  poliId: z.number().int().positive().optional().nullable(),
})

const updateSchema = z.object({
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'DOCTOR', 'REGISTRATION_OFFICER']).optional(),
  poliId: z.number().int().positive().optional().nullable(),
})

export const list = async (req, res) => {
  const { role } = req.query
  const where = role ? { role } : {}
  const users = await prisma.user.findMany({
    where,
    select: { id: true, username: true, role: true, poliId: true, poli: { select: { id: true, name: true, code: true } } },
    orderBy: { id: 'asc' },
  })
  return success(res, users)
}

export const getOne = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return failure(res, 'ID tidak valid', 400)
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, role: true, poliId: true, poli: { select: { id: true, name: true, code: true } } },
  })
  if (!user) return failure(res, 'User tidak ditemukan', 404)
  return success(res, user)
}

export const create = async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const { username, password, role, poliId } = parsed.data

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists) return failure(res, 'Username sudah digunakan', 409)

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { username, passwordHash, role, poliId: role === 'DOCTOR' ? (poliId || null) : null },
    select: { id: true, username: true, role: true, poliId: true },
  })
  return success(res, user, 'User berhasil dibuat', 201)
}

export const update = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return failure(res, 'ID tidak valid', 400)

  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const { username, password, role, poliId } = parsed.data

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return failure(res, 'User tidak ditemukan', 404)

  if (username && username !== existing.username) {
    const conflict = await prisma.user.findUnique({ where: { username } })
    if (conflict) return failure(res, 'Username sudah digunakan', 409)
  }

  const data = {}
  if (username) data.username = username
  if (password && password.length > 0) data.passwordHash = await bcrypt.hash(password, 10)
  if (role) {
    data.role = role
    data.poliId = role === 'DOCTOR' ? (poliId !== undefined ? poliId : existing.poliId) : null
  } else if (poliId !== undefined) {
    data.poliId = poliId
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, role: true, poliId: true },
  })
  return success(res, user, 'User berhasil diperbarui')
}

export const remove = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return failure(res, 'ID tidak valid', 400)
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return failure(res, 'User tidak ditemukan', 404)
  if (existing.id === req.user.id) return failure(res, 'Tidak dapat menghapus akun sendiri', 400)
  await prisma.user.delete({ where: { id } })
  return success(res, null, 'User berhasil dihapus')
}
