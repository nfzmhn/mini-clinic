import api from './api'

export async function createMedicalRecord(payload) {
  const { data } = await api.post('/medical-records', payload)
  return data
}

export async function getRecordsByPatient(patientId) {
  const { data } = await api.get(`/medical-records/patient/${patientId}`)
  return data
}

export async function getRecordByRegistration(registrationId) {
  const { data } = await api.get(`/medical-records/registration/${registrationId}`)
  return data
}
