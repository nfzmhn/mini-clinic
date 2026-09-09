import prisma from '../config/prisma.js'
import { success, failure } from '../utils/response.js'
import { z } from 'zod'

const itemSchema = z.object({
  medicine: z.string().min(1),
  dosage: z.string().min(1),
  qty: z.number().int().min(1),
  instruction: z.string().optional().default(''),
})

const prescriptionSchema = z.object({
  medicalRecordId: z.number(),
  notes: z.string().optional().default(''),
  items: z.array(itemSchema).min(1),
})

/**
 * POST /api/prescriptions
 * Buat resep baru untuk sebuah rekam medis yang sudah ada.
 */
export const create = async (req, res) => {
  const parsed = prescriptionSchema.safeParse(req.body)
  if (!parsed.success) return failure(res, 'Validation failed', 400, parsed.error.errors)

  const { medicalRecordId, notes, items } = parsed.data

  // Cek apakah rekam medis ada
  const record = await prisma.medicalRecord.findUnique({ where: { id: medicalRecordId } })
  if (!record) return failure(res, 'Rekam medis tidak ditemukan', 404)

  // Cek apakah sudah ada resep untuk rekam medis ini
  const existing = await prisma.prescription.findUnique({ where: { medicalRecordId } })
  if (existing) return failure(res, 'Resep untuk rekam medis ini sudah ada. Gunakan endpoint update.', 409)

  try {
    const prescription = await prisma.prescription.create({
      data: {
        medicalRecordId,
        notes,
        items: { create: items },
      },
      include: { items: true },
    })
    return success(res, prescription, 'Resep berhasil dibuat', 201)
  } catch (e) {
    return failure(res, e.message, 400)
  }
}

/**
 * GET /api/prescriptions/:id
 * Ambil detail resep beserta item-nya berdasarkan ID resep.
 */
export const getById = async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return failure(res, 'ID tidak valid', 400)

  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: {
      items: true,
      medicalRecord: {
        include: {
          patient: { select: { id: true, name: true, mrn: true } },
          doctor: { select: { id: true, username: true } },
        },
      },
    },
  })

  if (!prescription) return failure(res, 'Resep tidak ditemukan', 404)
  return success(res, prescription)
}
