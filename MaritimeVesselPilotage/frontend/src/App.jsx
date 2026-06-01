import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout.jsx'

const Home = () => <div>首页</div>
const PilotageCalendar = () => <div>引航日历</div>
const PilotSchedule = () => <div>引航员排班</div>
const TideManagement = () => <div>潮汐管理</div>
const VesselManagement = () => <div>船舶管理</div>
const TugManagement = () => <div>拖轮管理</div>
const OrderManagement = () => <div>预约管理</div>
const AssignmentManagement = () => <div>任务分配</div>
const CompletionManagement = () => <div>完成单管理</div>
const BillingManagement = () => <div>计费管理</div>
const NotificationManagement = () => <div>系统通知</div>

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<div>登录页</div>} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="calendar" element={<PilotageCalendar />} />
        <Route path="pilot-schedule" element={<PilotSchedule />} />
        <Route path="tide" element={<TideManagement />} />
        <Route path="vessel" element={<VesselManagement />} />
        <Route path="tug" element={<TugManagement />} />
        <Route path="order" element={<OrderManagement />} />
        <Route path="assignment" element={<AssignmentManagement />} />
        <Route path="completion" element={<CompletionManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="notification" element={<NotificationManagement />} />
      </Route>
    </Routes>
  )
}

export default App
