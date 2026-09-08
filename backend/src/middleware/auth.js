import jwt from 'jsonwebtoken'
import { failure } from '../utils/response.js'

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return failure(res, 'Unauthorized', 401)
  try {
    const token = header.split(' ')[1]
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return failure(res, 'Invalid or expired token', 401)
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return failure(res, 'Forbidden', 403)
  next()
}
