import prisma from '../config/prisma.js'
import { success } from '../utils/response.js'

export const stats = async (req, res) => {
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const [patients, registrations, menunggu, polis] = await Promise.all([
    prisma.patient.count(),
    prisma.registration.count({ where: { visitDate: { gte: today, lt: tomorrow } } }),
    prisma.registration.count({ where: { status: 'Menunggu', visitDate: { gte: today, lt: tomorrow } } }),
    prisma.poli.count(),
  ])
  return success(res, { patients, registrations, menunggu, polis })
}
