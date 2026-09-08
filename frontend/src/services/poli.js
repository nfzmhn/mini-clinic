import api from './api'

export async function getPolis() {
  const { data } = await api.get('/polis')
  return data
}

export async function createPoli(payload) {
  const { data } = await api.post('/polis', payload)
  return data
}

export async function updatePoli(id, payload) {
  const { data } = await api.put(`/polis/${id}`, payload)
  return data
}

export async function deletePoli(id) {
  const { data } = await api.delete(`/polis/${id}`)
  return data
}
