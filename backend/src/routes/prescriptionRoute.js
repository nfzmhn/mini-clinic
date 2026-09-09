import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { create, getById } from '../controllers/prescriptionController.js'

const r = Router()
r.use(authenticate)

r.post('/', authorize('DOCTOR', 'ADMIN'), create)   // POST /api/prescriptions
r.get('/:id', getById)                              // GET  /api/prescriptions/:id

export default r
