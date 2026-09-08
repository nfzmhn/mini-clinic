import api from './api'

export async function getRegistrations(params = {}) {
  const { data } = await api.get('/registrations', { params })
  return data
}

export async function createRegistration(payload) {
  const { data } = await api.post('/registrations', payload)
  return data
}

export async function updateRegistrationStatus(id, status) {
  const { data } = await api.put(`/registrations/${id}/status`, { status })
  return data
}

export async function callNextQueue(poliId) {
  const { data } = await api.post('/registrations/call-next', null, { params: { poliId } })
  return data
}