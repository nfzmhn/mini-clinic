import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { success } from '../utils/response.js'

const r = Router()
r.post('/login', login)
// JWT is stateless; client must clear the token. Server responds 200 to confirm.
r.post('/logout', authenticate, (req, res) => success(res, null, 'Logout berhasil'))
r.get('/me', authenticate, me)
r.post('/register', authenticate, authorize('ADMIN'), register)
export default r
