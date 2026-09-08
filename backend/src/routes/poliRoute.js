import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as c from '../controllers/poliController.js'

const r = Router()
r.get('/', c.list)
r.use(authenticate)
r.post('/', authorize('ADMIN'), c.create)
r.put('/:id', authorize('ADMIN'), c.update)
r.delete('/:id', authorize('ADMIN'), c.remove)
export default r
