import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as c from '../controllers/patientController.js'

const r = Router()
r.use(authenticate)
r.get('/', c.list)
r.get('/:id', c.getOne)
r.post('/', authorize('ADMIN', 'REGISTRATION_OFFICER'), c.create)
r.put('/:id', authorize('ADMIN', 'REGISTRATION_OFFICER'), c.update)
r.delete('/:id', authorize('ADMIN'), c.remove)
export default r
