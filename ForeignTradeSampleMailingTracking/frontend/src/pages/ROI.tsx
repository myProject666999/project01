import { useEffect, useState } from 'react';
import { roiAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ROI = () => {
  const [roiData, setRoiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadROIData();
  }, []);

  const loadROIData = async () => {
    try {
      const res = await roiAPI.getSampleROI();
      setRoiData(res.data);
    } catch (error) {
      console.error('Failed to load ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getROIBadge = (roi: number) => {
    if (roi > 100) return 'bg-green-100 text-green-800';
    if (roi > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) return <div className="text-center py-10">加载中...</div>;

  const chartData = roiData.map((item) => ({
    name: item.model,
    ROI: parseFloat(item.roi.toFixed(2)),
    订单数: item.totalOrders,
    寄样数: item.totalMailings,
  }));

  const pieData = roiData.map((item) => ({
    name: item.model,
    value: item.totalRevenue,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ROI 分析</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">各样品 ROI 对比</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value}%`, 'ROI']} />
              <Bar dataKey="ROI" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">营收分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '营收']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">详细 ROI 数据</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">样品型号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">寄样次数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">总成本</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">转化订单</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">总营收</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">转化率</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">平均订单金额</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roiData.map((item) => (
              <tr key={item.sampleId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{item.model}</td>
                <td className="px-4 py-3 text-sm">{item.totalMailings} 次</td>
                <td className="px-4 py-3 text-sm">¥{item.totalCost.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{item.totalOrders} 单</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  ¥{item.totalRevenue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">{item.conversionRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">
                  {item.averageOrderValue > 0 ? `¥${item.averageOrderValue.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getROIBadge(item.roi)}`}>
                    {item.roi.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📊 ROI 计算公式说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>总成本</strong> = 寄样次数 × 样品单位成本</li>
          <li>• <strong>总营收</strong> = 所有下单客户的订单金额总和</li>
          <li>• <strong>ROI</strong> = (总营收 - 总成本) ÷ 总成本 × 100%</li>
          <li>• ROI {'>'} 0 表示盈利，数值越高越好；ROI {'<'} 0 表示亏损</li>
        </ul>
      </div>
    </div>
  );
};

export default ROI;
