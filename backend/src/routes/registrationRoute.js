import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as c from '../controllers/registrationController.js'

const r = Router()
r.use(authenticate)
r.get('/', c.list)
r.get('/:id', c.getOne)
r.post('/', c.create)
r.put('/:id/status', c.updateStatus)
r.post('/call-next', c.callNext)
export default r
