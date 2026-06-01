import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherSlots from './pages/TeacherSlots';
import TeacherAppointments from './pages/TeacherAppointments';
import ParentDashboard from './pages/ParentDashboard';
import ParentTeachers from './pages/ParentTeachers';
import ParentAppointments from './pages/ParentAppointments';
import VideoRoom from './pages/VideoRoom';
import MeetingSummary from './pages/MeetingSummary';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, user, token, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user, fetchCurrentUser]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/slots"
          element={
            <ProtectedRoute role="teacher">
              <TeacherSlots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/appointments"
          element={
            <ProtectedRoute role="teacher">
              <TeacherAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/teachers"
          element={
            <ProtectedRoute role="parent">
              <ParentTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/appointments"
          element={
            <ProtectedRoute role="parent">
              <ParentAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <VideoRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting-summary/:appointmentId"
          element={
            <ProtectedRoute>
              <MeetingSummary />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
