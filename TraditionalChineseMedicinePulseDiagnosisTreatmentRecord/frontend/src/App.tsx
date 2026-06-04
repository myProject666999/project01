import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import PatientList from './pages/PatientList'
import PatientDetail from './pages/PatientDetail'
import ConsultationForm from './pages/ConsultationForm'
import PrescriptionForm from './pages/PrescriptionForm'
import PrescriptionComparison from './pages/PrescriptionComparison'
import HerbLibrary from './pages/HerbLibrary'
import CompatibilityRules from './pages/CompatibilityRules'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="consultations/new/:patientId" element={<ConsultationForm />} />
        <Route path="consultations/edit/:id" element={<ConsultationForm />} />
        <Route path="prescriptions/new/:patientId" element={<PrescriptionForm />} />
        <Route path="prescriptions/new/from/:sourceId" element={<PrescriptionForm />} />
        <Route path="prescriptions/edit/:id" element={<PrescriptionForm />} />
        <Route path="prescriptions/comparison/:patientId" element={<PrescriptionComparison />} />
        <Route path="herbs" element={<HerbLibrary />} />
        <Route path="compatibility" element={<CompatibilityRules />} />
      </Route>
    </Routes>
  )
}

export default App
