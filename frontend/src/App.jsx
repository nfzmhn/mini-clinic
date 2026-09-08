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
import Layout from './components/layout/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patients" element={<Layout><PatientsPage /></Layout>} />
          <Route path="/queue" element={<QueueBoardPage />} />
          <Route path="/doctor" element={<DoctorExaminationPage />} />
          <Route path="/doctor/queue" element={<DoctorQueuePage />} />
          <Route path="/records" element={<MedicalRecordsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
