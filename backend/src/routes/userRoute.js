import { Router } from 'express'
import { list, getOne, create, update, remove } from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const r = Router()
r.use(authenticate)

// Semua user yang login bisa GET (dibutuhkan untuk dropdown dokter di modal pendaftaran)
r.get('/', list)
r.get('/:id', getOne)

// Hanya ADMIN yang bisa create/update/delete user
r.post('/', authorize('ADMIN'), create)
r.put('/:id', authorize('ADMIN'), update)
r.delete('/:id', authorize('ADMIN'), remove)

export default r
