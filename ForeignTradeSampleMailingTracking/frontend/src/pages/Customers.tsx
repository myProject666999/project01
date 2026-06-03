import { useEffect, useState } from 'react';
import { customersAPI } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({ crm_customer_id: '', name: '', country: '', email: '', phone: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await customersAPI.getAll();
      setCustomers(res.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
      } else {
        await customersAPI.create(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ crm_customer_id: '', name: '', country: '', email: '', phone: '' });
      loadCustomers();
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      crm_customer_id: customer.crm_customer_id,
      name: customer.name,
      country: customer.country || '',
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定删除此客户？')) {
      try {
        await customersAPI.delete(id);
        loadCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">客户管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 添加客户
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">CRM ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">客户名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">国家</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">邮箱</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">电话</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-4 py-3 text-sm font-mono">{customer.crm_customer_id}</td>
                <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-sm">{customer.country}</td>
                <td className="px-4 py-3 text-sm">{customer.email}</td>
                <td className="px-4 py-3 text-sm">{customer.phone}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 mr-3">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCustomer ? '编辑客户' : '添加客户'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">CRM ID</label>
                <input
                  type="text"
                  value={formData.crm_customer_id}
                  onChange={(e) => setFormData({ ...formData, crm_customer_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">客户名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">国家</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">电话</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCustomer(null); }}
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

export default Customers;
