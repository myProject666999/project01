import { useState, useEffect } from 'react';
import { teacherAPI, timeSlotAPI, appointmentAPI } from '../api';
import type { User as UserType, TimeSlot } from '../types';
import { Search, Filter, Calendar, Clock, User as UserIcon, Mail, Phone, X } from 'lucide-react';
import Loading from '../components/Loading';

function ParentTeachers() {
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<UserType | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingForm, setBookingForm] = useState({
    subject: '',
    description: '',
  });

  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育'];

  useEffect(() => {
    fetchTeachers();
  }, [subjectFilter]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getTeachers(subjectFilter || undefined);
      if (response.code === 200) {
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSlots = async (teacherId: number) => {
    try {
      const response = await timeSlotAPI.getTeacherSlots(teacherId);
      if (response.code === 200) {
        setSlots(response.data.filter((s) => s.status === 'available'));
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const handleSelectTeacher = async (teacher: UserType) => {
    setSelectedTeacher(teacher);
    setShowBookingModal(true);
    await fetchTeacherSlots(teacher.id);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedTeacher) return;

    try {
      const response = await appointmentAPI.createAppointment({
        timeSlotId: selectedSlot.id,
        teacherId: selectedTeacher.id,
        subject: bookingForm.subject,
        description: bookingForm.description,
      });
      if (response.code === 200) {
        alert('预约成功！等待老师确认');
        closeModal();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '预约失败');
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
    setSelectedTeacher(null);
    setSelectedSlot(null);
    setSlots([]);
    setBookingForm({ subject: '', description: '' });
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.includes(searchQuery) ||
    (teacher.subject && teacher.subject.includes(searchQuery))
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">老师列表</h1>
        <p className="text-gray-600 mt-1">选择老师并预约沟通时段</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索老师姓名或科目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">全部科目</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="card text-center py-16">
          <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无老师</h3>
          <p className="text-gray-500">
            {subjectFilter ? `当前没有教授${subjectFilter}的老师` : '还没有老师注册'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="h-7 w-7 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {teacher.subject}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {teacher.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {teacher.phone}
                </div>
              </div>

              <button
                onClick={() => handleSelectTeacher(teacher)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                预约时段
              </button>
            </div>
          ))}
        </div>
      )}

      {showBookingModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">预约 {selectedTeacher.name} 老师</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedTeacher.subject}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary-600" />
                  选择可用时段
                </h4>
                {slots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>该老师暂无可用时段</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedSlot?.id === slot.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{slot.date}</div>
                          <div className="text-sm text-gray-500">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {selectedSlot && (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      沟通主题
                    </label>
                    <input
                      type="text"
                      value={bookingForm.subject}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                      className="input-field"
                      placeholder="请输入沟通主题"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      详细说明
                    </label>
                    <textarea
                      value={bookingForm.description}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="input-field min-h-[100px] resize-none"
                      placeholder="请详细描述需要沟通的内容..."
                      required
                    />
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
                      确认预约
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentTeachers;
