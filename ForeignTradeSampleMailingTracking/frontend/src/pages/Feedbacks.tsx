import { useEffect, useState } from 'react';
import { feedbacksAPI, mailingsAPI } from '../services/api';

const Feedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [mailings, setMailings] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    mailing_id: '',
    feedback_type: 'satisfied',
    order_amount: '',
    follow_up_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedbacksRes, mailingsRes] = await Promise.all([
        feedbacksAPI.getAll(),
        mailingsAPI.getAll(),
      ]);
      setFeedbacks(feedbacksRes.data);
      setMailings(mailingsRes.data.filter((m: any) => !m.feedback));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await feedbacksAPI.create({
        ...formData,
        mailing_id: parseInt(formData.mailing_id),
        order_amount: formData.order_amount ? parseFloat(formData.order_amount) : 0,
      });
      setShowModal(false);
      setFormData({
        mailing_id: '',
        feedback_type: 'satisfied',
        order_amount: '',
        follow_up_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create feedback:', error);
    }
  };

  const getFeedbackBadge = (type: string) => {
    const styles: Record<string, string> = {
      satisfied: 'bg-green-100 text-green-800',
      ordered: 'bg-blue-100 text-blue-800',
      bargain: 'bg-yellow-100 text-yellow-800',
      discarded: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      satisfied: '满意',
      ordered: '下单',
      bargain: '砍价',
      discarded: '弃用',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">客户反馈</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 记录反馈
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">快递单号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">客户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">样品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">反馈类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">订单金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">跟进日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {feedbacks.map((feedback) => (
              <tr key={feedback.id}>
                <td className="px-4 py-3 text-sm font-mono">{feedback.mailing?.tracking_number}</td>
                <td className="px-4 py-3 text-sm">{feedback.mailing?.customer?.name}</td>
                <td className="px-4 py-3 text-sm">{feedback.mailing?.sample?.model}</td>
                <td className="px-4 py-3">{getFeedbackBadge(feedback.feedback_type)}</td>
                <td className="px-4 py-3 text-sm">
                  {feedback.order_amount > 0 ? `¥${feedback.order_amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">{feedback.follow_up_date}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{feedback.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">记录客户反馈</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">寄样记录</label>
                <select
                  value={formData.mailing_id}
                  onChange={(e) => setFormData({ ...formData, mailing_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">请选择寄样记录</option>
                  {mailings.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.tracking_number} - {m.customer?.name} - {m.sample?.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">反馈类型</label>
                <select
                  value={formData.feedback_type}
                  onChange={(e) => setFormData({ ...formData, feedback_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="satisfied">😊 满意</option>
                  <option value="ordered">💰 下单</option>
                  <option value="bargain">🤝 砍价</option>
                  <option value="discarded">❌ 弃用</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">订单金额 (如有下单)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.order_amount}
                  onChange={(e) => setFormData({ ...formData, order_amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="如未下单可留空"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">跟进日期</label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">跟进备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedbacks;
