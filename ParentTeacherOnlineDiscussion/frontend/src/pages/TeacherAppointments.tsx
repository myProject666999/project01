import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, roomAPI } from '../api';
import type { Appointment } from '../types';
import { Calendar, Clock, User, CheckCircle, XCircle, Video, Filter, AlertCircle } from 'lucide-react';
import Loading from '../components/Loading';

function TeacherAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await appointmentAPI.getMyAppointments(status);
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      const response = await appointmentAPI.confirmAppointment(id);
      if (response.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? response.data : a))
        );
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('确定要取消这个预约吗？')) return;
    try {
      const response = await appointmentAPI.cancelAppointment(id);
      if (response.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? response.data : a))
        );
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleEnterRoom = async (appointment: Appointment) => {
    try {
      const response = await roomAPI.getRoomToken(appointment.id);
      if (response.success) {
        const { roomId, token } = response.data;
        navigate(`/room/${roomId}?token=${token}`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '获取房间信息失败');
    }
  };

  const handleViewSummary = (appointmentId: number) => {
    navigate(`/meeting-summary/${appointmentId}`);
  };

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

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待确认' },
    { value: 'confirmed', label: '已确认' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预约管理</h1>
          <p className="text-gray-600 mt-1">查看和处理家长的预约请求</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-32"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预约</h3>
          <p className="text-gray-500">
            {filter === 'all' ? '还没有家长预约您的时段' : '当前筛选条件下没有预约'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((appointment) => (
              <div key={appointment.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.subject}
                      </h3>
                      {getStatusBadge(appointment.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          家长：{appointment.parent?.name || '未知'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          日期：{appointment.timeSlot?.date || '未安排'}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          时间：{appointment.timeSlot?.startTime || '-'} - {appointment.timeSlot?.endTime || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">预约说明：</p>
                      <p className="text-gray-700">{appointment.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:ml-6">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(appointment.id)}
                          className="btn-primary flex items-center justify-center"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          确认
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="btn-outline text-red-600 border-red-600 hover:bg-red-50 flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          拒绝
                        </button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleEnterRoom(appointment)}
                          className="btn-secondary flex items-center justify-center"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          进入房间
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="btn-outline text-red-600 border-red-600 hover:bg-red-50 flex items-center justify-center"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          取消
                        </button>
                      </>
                    )}

                    {appointment.status === 'completed' && (
                      <button
                        onClick={() => handleViewSummary(appointment.id)}
                        className="btn-primary flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        查看纪要
                      </button>
                    )}

                    {(appointment.status === 'pending' ||
                      appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleViewSummary(appointment.id)}
                        className="btn-outline flex items-center justify-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        纪要/评分
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default TeacherAppointments;
