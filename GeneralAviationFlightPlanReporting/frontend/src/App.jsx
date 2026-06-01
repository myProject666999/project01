import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import FlightPlanList from './pages/FlightPlanList'
import FlightPlanForm from './pages/FlightPlanForm'
import FlightPlanDetail from './pages/FlightPlanDetail'
import ApprovalList from './pages/ApprovalList'
import ApprovalConfig from './pages/ApprovalConfig'
import AircraftList from './pages/AircraftList'
import AirspaceList from './pages/AirspaceList'
import PilotList from './pages/PilotList'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flight-plans" element={<FlightPlanList />} />
            <Route path="/flight-plans/new" element={<FlightPlanForm />} />
            <Route path="/flight-plans/edit/:id" element={<FlightPlanForm />} />
            <Route path="/flight-plans/:id" element={<FlightPlanDetail />} />
            <Route path="/approvals" element={<ApprovalList />} />
            <Route path="/approval-config" element={<ApprovalConfig />} />
            <Route path="/aircrafts" element={<AircraftList />} />
            <Route path="/airspaces" element={<AirspaceList />} />
            <Route path="/pilots" element={<PilotList />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
