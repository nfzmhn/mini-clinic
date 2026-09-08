import { Router } from 'express'
import { login, me } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const r = Router()
r.post('/login', login)
r.get('/me', authenticate, me)
export default r
