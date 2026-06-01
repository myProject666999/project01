import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { meetingSummaryAPI, ratingAPI, appointmentAPI } from '../api';
import type { MeetingSummary, Rating, Appointment } from '../types';
import { FileText, Star, Save, ArrowLeft, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import Loading from '../components/Loading';
import StarRating from '../components/StarRating';

function MeetingSummaryPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [summaryContent, setSummaryContent] = useState('');
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const isTeacher = user?.role === 'teacher';
  const isParent = user?.role === 'parent';

  useEffect(() => {
    fetchData();
  }, [appointmentId]);

  const fetchData = async () => {
    if (!appointmentId) return;

    try {
      setLoading(true);
      const aptId = parseInt(appointmentId);

      const [aptRes, summaryRes, ratingRes] = await Promise.all([
        appointmentAPI.getAppointmentDetail(aptId),
        meetingSummaryAPI.getSummaryByAppointment(aptId).catch(() => ({ data: null })),
        ratingAPI.getRatingByAppointment(aptId).catch(() => ({ data: null })),
      ]);

      if (aptRes.code === 200) {
        setAppointment(aptRes.data);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
        setSummaryContent(summaryRes.data.content);
      }
      if (ratingRes.data) {
        setRating(ratingRes.data);
        setRatingScore(ratingRes.data.score);
        setRatingComment(ratingRes.data.comment);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!appointmentId || !summaryContent.trim()) {
      alert('请输入纪要内容');
      return;
    }

    try {
      setSaving(true);
      const aptId = parseInt(appointmentId);

      if (summary) {
        const response = await meetingSummaryAPI.updateSummary(summary.id, summaryContent);
        if (response.code === 200) {
          setSummary(response.data);
          alert('纪要更新成功');
        }
      } else {
        const response = await meetingSummaryAPI.createSummary({
          appointmentId: aptId,
          content: summaryContent,
        });
        if (response.code === 200) {
          setSummary(response.data);
          alert('纪要保存成功');
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRating = async () => {
    if (!appointmentId || ratingScore === 0) {
      alert('请选择评分');
      return;
    }

    try {
      setSaving(true);
      const aptId = parseInt(appointmentId);

      const response = await ratingAPI.createRating({
        appointmentId: aptId,
        score: ratingScore,
        comment: ratingComment,
      });
      if (response.code === 200) {
        setRating(response.data);
        alert('评分保存成功');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-16">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">预约不存在</h3>
          <button onClick={() => navigate(-1)} className="btn-primary">
            返回
          </button>
        </div>
      </div>
    );
  }

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </button>

        <h1 className="text-2xl font-bold text-gray-900">面谈纪要与评分</h1>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">预约信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">
              老师：{appointment.teacher?.name || '未知'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">
              家长：{appointment.parent?.name || '未知'}
            </span>
          </div>
          <div className="flex items-center">
            {getStatusBadge(appointment.status)}
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
          <p className="text-sm text-gray-500 mb-1">沟通主题：</p>
          <p className="text-gray-700 font-medium">{appointment.subject}</p>
          <p className="text-sm text-gray-500 mt-2 mb-1">预约说明：</p>
          <p className="text-gray-700">{appointment.description}</p>
        </div>
      </div>

      {isTeacher && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            面谈纪要
            {summary && (
              <span className="ml-2 text-sm text-gray-500">(已保存)</span>
            )}
          </h2>

          <div className="space-y-4">
            <textarea
              value={summaryContent}
              onChange={(e) => setSummaryContent(e.target.value)}
              className="input-field min-h-[200px] resize-none"
              placeholder="请输入本次面谈的纪要内容..."
            />

            <button
              onClick={handleSaveSummary}
              disabled={saving || !summaryContent.trim()}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : summary ? '更新纪要' : '保存纪要'}
            </button>

            {summary && (
              <div className="text-sm text-gray-500">
                最后更新于：{new Date(summary.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {isParent && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            满意度评分
            {rating && (
              <span className="ml-2 text-sm text-gray-500">(已评分)</span>
            )}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                请对本次服务进行评分
              </label>
              <div className="flex items-center space-x-4">
                <StarRating
                  value={ratingScore}
                  onChange={setRatingScore}
                  size="lg"
                  readonly={!!rating}
                />
                <span className="text-2xl font-bold text-gray-900">
                  {ratingScore > 0 ? `${ratingScore} 分` : '未评分'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评价内容（可选）
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className="input-field min-h-[120px] resize-none"
                placeholder="请分享您对本次服务的评价和建议..."
                readOnly={!!rating}
              />
            </div>

            {!rating && (
              <button
                onClick={handleSaveRating}
                disabled={saving || ratingScore === 0}
                className="btn-secondary flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '保存中...' : '提交评分'}
              </button>
            )}

            {rating && (
              <div className="text-sm text-gray-500">
                评分时间：{new Date(rating.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {isParent && summary && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            老师填写的纪要
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
          </div>
          <div className="text-sm text-gray-500 mt-3">
            更新于：{new Date(summary.updatedAt).toLocaleString()}
          </div>
        </div>
      )}

      {isTeacher && rating && (
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            家长的评分
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <StarRating value={rating.score} size="lg" readonly />
            <span className="text-2xl font-bold text-gray-900">
              {rating.score} 分
            </span>
          </div>
          {rating.comment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{rating.comment}</p>
            </div>
          )}
          <div className="text-sm text-gray-500 mt-3">
            评分时间：{new Date(rating.createdAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingSummaryPage;
