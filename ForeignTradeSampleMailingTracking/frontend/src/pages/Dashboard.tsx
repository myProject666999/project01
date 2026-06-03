import { useEffect, useState } from 'react';
import { roiAPI, mailingsAPI, trackingAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentMailings, setRecentMailings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, mailingsRes] = await Promise.all([
        roiAPI.getDashboard(),
        mailingsAPI.getAll(),
      ]);
      setStats(statsRes.data);
      setRecentMailings(mailingsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePollTracking = async () => {
    try {
      await trackingAPI.poll();
      alert('追踪状态轮询已触发');
      loadData();
    } catch (error) {
      console.error('Failed to poll tracking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      exception: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      pending: '待发货',
      in_transit: '在途',
      delivered: '已签收',
      exception: '异常',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) return <div className="text-center py-10">加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
        <button
          onClick={handlePollTracking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 刷新快递状态
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">总寄样数</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.totalMailings || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">已签收</div>
          <div className="text-3xl font-bold text-green-600">{stats?.deliveredMailings || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">转化订单</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.orderedFeedbacks || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500">总营收</div>
          <div className="text-3xl font-bold text-orange-600">¥{(stats?.totalRevenue || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">最近寄样</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">快递单号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">客户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">样品</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">寄件日期</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentMailings.map((mailing) => (
                <tr key={mailing.id}>
                  <td className="px-4 py-3 text-sm font-mono">{mailing.tracking_number}</td>
                  <td className="px-4 py-3 text-sm">{mailing.customer?.name}</td>
                  <td className="px-4 py-3 text-sm">{mailing.sample?.model}</td>
                  <td className="px-4 py-3">{getStatusBadge(mailing.status)}</td>
                  <td className="px-4 py-3 text-sm">{mailing.mailing_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
