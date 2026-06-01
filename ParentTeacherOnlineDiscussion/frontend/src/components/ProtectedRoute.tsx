import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    const redirectPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
