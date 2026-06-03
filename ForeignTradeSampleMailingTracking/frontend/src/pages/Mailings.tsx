import { useEffect, useState } from 'react';
import { mailingsAPI, samplesAPI, customersAPI, couriersAPI, trackingAPI } from '../services/api';

const Mailings = () => {
  const [mailings, setMailings] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedMailing, setSelectedMailing] = useState<any>(null);
  const [trackingLogs, setTrackingLogs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    sample_id: '',
    quantity: 1,
    courier_id: '',
    tracking_number: '',
    mailing_date: new Date().toISOString().split('T')[0],
    shipping_cost: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mailingsRes, samplesRes, customersRes, couriersRes] = await Promise.all([
        mailingsAPI.getAll(),
        samplesAPI.getAll(),
        customersAPI.getAll(),
        couriersAPI.getAll(),
      ]);
      setMailings(mailingsRes.data);
      setSamples(samplesRes.data);
      setCustomers(customersRes.data);
      setCouriers(couriersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mailingsAPI.create({
        ...formData,
        customer_id: parseInt(formData.customer_id),
        sample_id: parseInt(formData.sample_id),
        courier_id: parseInt(formData.courier_id),
        quantity: parseInt(formData.quantity.toString()),
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
      });
      setShowModal(false);
      setFormData({
        customer_id: '',
        sample_id: '',
        quantity: 1,
        courier_id: '',
        tracking_number: '',
        mailing_date: new Date().toISOString().split('T')[0],
        shipping_cost: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create mailing:', error);
    }
  };

  const handleViewTracking = async (mailing: any) => {
    setSelectedMailing(mailing);
    try {
      const res = await trackingAPI.getLogs(mailing.id);
      setTrackingLogs(res.data);
    } catch (error) {
      setTrackingLogs([]);
    }
    setShowTrackingModal(true);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">寄样登记</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 新增寄样
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">快递单号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">客户</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">样品</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">数量</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">快递</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">寄件日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mailings.map((mailing) => (
              <tr key={mailing.id}>
                <td className="px-4 py-3 text-sm font-mono">{mailing.tracking_number}</td>
                <td className="px-4 py-3 text-sm">{mailing.customer?.name}</td>
                <td className="px-4 py-3 text-sm">{mailing.sample?.model}</td>
                <td className="px-4 py-3 text-sm">{mailing.quantity}</td>
                <td className="px-4 py-3 text-sm">{mailing.courier?.name}</td>
                <td className="px-4 py-3">{getStatusBadge(mailing.status)}</td>
                <td className="px-4 py-3 text-sm">{mailing.mailing_date}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleViewTracking(mailing)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    查看追踪
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新增寄样</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">客户</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">请选择客户</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.crm_customer_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">样品</label>
                <select
                  value={formData.sample_id}
                  onChange={(e) => setFormData({ ...formData, sample_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">请选择样品</option>
                  {samples.map((s) => (
                    <option key={s.id} value={s.id}>{s.model} (¥{s.unit_cost})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">数量</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">快递公司</label>
                  <select
                    value={formData.courier_id}
                    onChange={(e) => setFormData({ ...formData, courier_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">请选择快递</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">快递单号</label>
                <input
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">寄件日期</label>
                  <input
                    type="date"
                    value={formData.mailing_date}
                    onChange={(e) => setFormData({ ...formData, mailing_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">运费</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
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

      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">物流追踪 - {selectedMailing?.tracking_number}</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trackingLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无追踪记录</p>
              ) : (
                trackingLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      {index < trackingLogs.length - 1 && <div className="w-0.5 h-full bg-gray-200"></div>}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-sm text-gray-500">{new Date(log.tracked_at).toLocaleString()}</span>
                      </div>
                      {log.location && <p className="text-sm text-gray-600 mt-1">📍 {log.location}</p>}
                      {log.description && <p className="text-sm text-gray-600">{log.description}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mailings;
