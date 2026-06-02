import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { appointmentAPI } from '../api';
import type { Appointment } from '../types';
import { Calendar, Users, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Loading from '../components/Loading';

function ParentDashboard() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
    confirmedAppointments: appointments.filter((a) => a.status === 'confirmed').length,
    completedAppointments: appointments.filter((a) => a.status === 'completed').length,
  };

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'pending' || a.status === 'confirmed')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
    };
    const labels: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      cancelled: '已取消',
      completed: '已完成',
      in_progress: '进行中',
    };
    return (
      <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{user?.name}家长
        </h1>
        <p className="text-gray-600 mt-1">管理您的孩子与老师的沟通</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">总预约数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">待确认</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">已确认</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              即将到来的预约
            </h2>
            <Link
              to="/parent/appointments"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              查看全部 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>暂无预约</p>
              <p className="text-sm mt-1">去老师列表预约吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.teacher?.name || '老师'}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {appointment.timeSlot?.date} {appointment.timeSlot?.startTime}
                    </p>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              快捷操作
            </h2>
          </div>

          <div className="space-y-4">
            <Link
              to="/parent/teachers"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <div className="p-2 rounded-lg bg-primary-500 text-white">
                <Users className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">老师列表</p>
                <p className="text-sm text-gray-500">浏览所有老师并预约时段</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              to="/parent/appointments"
              className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
            >
              <div className="p-2 rounded-lg bg-secondary-500 text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium text-gray-900">我的预约</p>
                <p className="text-sm text-gray-500">查看所有预约记录</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;
