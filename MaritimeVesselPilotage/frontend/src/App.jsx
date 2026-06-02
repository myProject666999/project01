import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout.jsx'
import Login from './pages/Login.jsx'
import AuthRoute from './components/AuthRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PilotageCalendar from './pages/PilotageCalendar.jsx'
import PilotSchedule from './pages/PilotSchedule.jsx'
import TideManagement from './pages/TideManagement.jsx'
import VesselManagement from './pages/VesselManagement.jsx'
import TugManagement from './pages/TugManagement.jsx'
import PilotageOrder from './pages/PilotageOrder.jsx'
import Assignment from './pages/Assignment.jsx'
import CompletionManagement from './pages/CompletionManagement.jsx'
import BillingManagement from './pages/BillingManagement.jsx'
import NotificationManagement from './pages/NotificationManagement.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <AuthRoute>
          <MainLayout />
        </AuthRoute>
      }>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Dashboard />} />
        <Route path="calendar" element={<PilotageCalendar />} />
        <Route path="pilot-schedule" element={<PilotSchedule />} />
        <Route path="tide" element={<TideManagement />} />
        <Route path="vessel" element={<VesselManagement />} />
        <Route path="tug" element={<TugManagement />} />
        <Route path="order" element={<PilotageOrder />} />
        <Route path="assignment" element={<Assignment />} />
        <Route path="completion" element={<CompletionManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="notification" element={<NotificationManagement />} />
      </Route>
    </Routes>
  )
}

export default App
