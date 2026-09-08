import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/petugas/dashboard/DashboardPage'
import PatientsPage from './pages/petugas/patients/PatientsPage'
import QueueBoardPage from './pages/petugas/queue-board/QueueBoardPage'
import DoctorExaminationPage from './pages/doctor/soap/DoctorExaminationPage'
import DoctorQueuePage from './pages/doctor/queue/DoctorQueuePage'
import MedicalRecordsPage from './pages/doctor/records/MedicalRecordsPage'
import AdminDashboardPage from './pages/admin/dashboard/AdminDashboardPage'
import MasterPatientsPage from './pages/admin/patients/MasterPatientsPage'
import MasterPolisPage from './pages/admin/polis/MasterPolisPage'
import UsersPage from './pages/admin/users/UsersPage'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const queryClient = new QueryClient()

function RoleRedirect() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (!u) return <Navigate to="/login" replace />
    if (u.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (u.role === 'DOCTOR') return <Navigate to="/doctor/queue" replace />
    return <Navigate to="/dashboard" replace />
  } catch { return <Navigate to="/login" replace /> }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />

          {/* Petugas (REGISTRATION_OFFICER) routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['REGISTRATION_OFFICER']}>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute roles={['REGISTRATION_OFFICER']}>
              <Layout><PatientsPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/queue" element={
            <ProtectedRoute roles={['REGISTRATION_OFFICER']}>
              <QueueBoardPage />
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor/queue" element={
            <ProtectedRoute roles={['DOCTOR']}>
              <DoctorQueuePage />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute roles={['DOCTOR']}>
              <DoctorExaminationPage />
            </ProtectedRoute>
          } />
          <Route path="/records" element={
            <ProtectedRoute roles={['DOCTOR']}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute roles={['ADMIN']}>
              <MasterPatientsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/polis" element={
            <ProtectedRoute roles={['ADMIN']}>
              <MasterPolisPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

          {/* Root — redirect by role */}
          <Route path="/" element={<RoleRedirect />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
