import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as c from '../controllers/medicalRecordController.js'

const r = Router()
r.use(authenticate)

r.post('/', authorize('DOCTOR', 'ADMIN'), c.create)   // POST /medical-records
r.get('/patient/:patientId', c.byPatient)             // GET  /medical-records/patient/:patientId (legacy)
r.get('/registration/:id', c.byRegistration)          // GET  /medical-records/registration/:id
r.get('/:patientId', c.byPatient)                     // GET  /medical-records/:patientId (spec-compliant)

export default r
