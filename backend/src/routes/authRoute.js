import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const r = Router()
r.post('/login', login)
r.get('/me', authenticate, me)
r.post('/register', authenticate, authorize('ADMIN'), register)
export default r
