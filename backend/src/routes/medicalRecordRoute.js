import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as c from '../controllers/medicalRecordController.js'

const r = Router()
r.use(authenticate)
r.post('/', authorize('DOCTOR', 'ADMIN'), c.create)
r.get('/patient/:patientId', c.byPatient)
r.get('/registration/:id', c.byRegistration)
export default r
