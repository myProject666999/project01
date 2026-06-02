import { useState, useEffect } from 'react';
import { timeSlotAPI } from '../api';
import type { TimeSlot, TimeSlotCreate } from '../types';
import { Plus, Edit2, Trash2, Calendar, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from '../components/Loading';

function TeacherSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState<TimeSlotCreate>({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await timeSlotAPI.getMySlots();
      if (response.success) {
        setSlots(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        const response = await timeSlotAPI.updateSlot(editingSlot.id, formData);
        if (response.success) {
          setSlots((prev) =>
            prev.map((s) => (s.id === editingSlot.id ? response.data : s))
          );
        }
      } else {
        const response = await timeSlotAPI.createSlot(formData);
        if (response.success) {
          setSlots((prev) => [...prev, response.data]);
        }
      }
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个时段吗？')) return;
    try {
      const response = await timeSlotAPI.deleteSlot(id);
      if (response.success) {
        setSlots((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '删除失败');
    }
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSlot(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter((s) => s.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      booked: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      available: '可预约',
      booked: '已预约',
      cancelled: '已取消',
    };
    return (
      <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">时段管理</h1>
          <p className="text-gray-600 mt-1">管理您的可预约时间段</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          添加时段
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded" />;
              }

              const daySlots = getSlotsForDate(date);
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toISOString()}
                  className={`h-24 p-1 rounded-lg border ${
                    isToday
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-colors`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isToday ? 'text-primary-600' : 'text-gray-700'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-0.5 overflow-hidden">
                    {daySlots.slice(0, 2).map((slot) => (
                      <div
                        key={slot.id}
                        className={`text-xs p-1 rounded ${
                          slot.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : slot.status === 'booked'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {slot.startTime}
                      </div>
                    ))}
                    {daySlots.length > 2 && (
                      <div className="text-xs text-gray-500">+{daySlots.length - 2}更多</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">时段列表</h2>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>暂无时段</p>
              <p className="text-sm">点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {slots
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium">{slot.date}</span>
                      </div>
                      {getStatusBadge(slot.status)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="flex space-x-1">
                        {slot.status === 'available' && (
                          <>
                            <button
                              onClick={() => openEditModal(slot)}
                              className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSlot ? '编辑时段' : '添加时段'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    开始时间
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    结束时间
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingSlot ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherSlots;
