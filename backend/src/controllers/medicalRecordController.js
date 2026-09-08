import { z } from 'zod'
import prisma from '../config/prisma.js'
import { success, failure } from '../utils/response.js'

const schema = z.object({
  registrationId: z.number(),
  patientId: z.number(),
  doctorId: z.number(),
  subjective: z.string().min(1),
  objective: z.string().optional().default(''),
  bp: z.string().optional().default(''),
  temp: z.number().optional().nullable(),
  weight: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  diagnosis: z.string().min(1),
  therapy: z.string().optional().default(''),
  actions: z.array(z.object({ name: z.string(), cost: z.number() })).optional(),
  prescription: z.object({
    notes: z.string().optional(),
    items: z.array(z.object({ medicine: z.string(), dosage: z.string(), qty: z.number(), instruction: z.string() })),
  }).optional(),
})

export const create = async (req, res) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)
  const { actions, prescription, ...data } = parsed.data
  try {
    const record = await prisma.medicalRecord.create({
      data: {
        ...data,
        actions: actions ? { create: actions } : undefined,
        prescription: prescription ? { create: { notes: prescription.notes, items: { create: prescription.items } } } : undefined,
      },
      include: { actions: true, prescription: { include: { items: true } } },
    })
    await prisma.registration.update({ where: { id: data.registrationId }, data: { status: 'Selesai' } })
    return success(res, record, 'Created', 201)
  } catch (e) {
    return failure(res, e.message, 400)
  }
}

export const byPatient = async (req, res) => {
  const data = await prisma.medicalRecord.findMany({
    where: { patientId: Number(req.params.patientId) },
    include: {
      actions: true,
      prescription: { include: { items: true } },
      registration: {
        include: {
          doctor: { select: { id: true, username: true } },
          poli: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return success(res, data)
}

export const byRegistration = async (req, res) => {
  const data = await prisma.medicalRecord.findUnique({ where: { registrationId: Number(req.params.id) }, include: { actions: true, prescription: { include: { items: true } } } })
  if (!data) return failure(res, 'Not found', 404)
  return success(res, data)
}
