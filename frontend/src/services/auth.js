import api from './api'

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}
