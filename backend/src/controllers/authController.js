import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'
import { z } from 'zod'
import { success, failure } from '../utils/response.js'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const { username, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return failure(res, 'Invalid credentials', 401)
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return failure(res, 'Invalid credentials', 401)
  const token = jwt.sign({ id: user.id, role: user.role, poliId: user.poliId }, process.env.JWT_SECRET, { expiresIn: '7d' })
  return success(res, { token, user: { id: user.id, username: user.username, role: user.role, poliId: user.poliId } }, 'Login success')
}

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, username: true, role: true, poliId: true } })
  return success(res, user)
}
