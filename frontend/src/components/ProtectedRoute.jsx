import { Navigate } from 'react-router-dom'

/**
 * ProtectedRoute — cek autentikasi + role sebelum render halaman
 * @param {string[]} roles - role yang diizinkan. Kosong = semua role yang login
 */
export default function ProtectedRoute({ children, roles = [] }) {
  let user = null
  let token = null

  try {
    token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    if (raw) user = JSON.parse(raw)
  } catch {
    user = null
    token = null
  }

  // Belum login sama sekali
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  // Sudah login tapi role tidak sesuai dengan halaman ini
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect ke halaman default sesuai role user yang sedang login
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/queue" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}
