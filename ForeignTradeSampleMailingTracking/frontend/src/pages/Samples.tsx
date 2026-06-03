import { useEffect, useState } from 'react';
import { samplesAPI } from '../services/api';

const Samples = () => {
  const [samples, setSamples] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSample, setEditingSample] = useState<any>(null);
  const [formData, setFormData] = useState({ model: '', unit_cost: '', weight: '', description: '' });

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      const res = await samplesAPI.getAll();
      setSamples(res.data);
    } catch (error) {
      console.error('Failed to load samples:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSample) {
        await samplesAPI.update(editingSample.id, formData);
      } else {
        await samplesAPI.create(formData);
      }
      setShowModal(false);
      setEditingSample(null);
      setFormData({ model: '', unit_cost: '', weight: '', description: '' });
      loadSamples();
    } catch (error) {
      console.error('Failed to save sample:', error);
    }
  };

  const handleEdit = (sample: any) => {
    setEditingSample(sample);
    setFormData({
      model: sample.model,
      unit_cost: sample.unit_cost,
      weight: sample.weight,
      description: sample.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定删除此样品？')) {
      try {
        await samplesAPI.delete(id);
        loadSamples();
      } catch (error) {
        console.error('Failed to delete sample:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">样品库</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + 添加样品
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">型号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">单位成本</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">重量(kg)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">描述</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {samples.map((sample) => (
              <tr key={sample.id}>
                <td className="px-4 py-3 text-sm font-medium">{sample.model}</td>
                <td className="px-4 py-3 text-sm">¥{sample.unit_cost}</td>
                <td className="px-4 py-3 text-sm">{sample.weight}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{sample.description}</td>
                <td className="px-4 py-3 text-sm">
                  <button onClick={() => handleEdit(sample)} className="text-blue-600 hover:text-blue-800 mr-3">
                    编辑
                  </button>
                  <button onClick={() => handleDelete(sample.id)} className="text-red-600 hover:text-red-800">
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
            <h2 className="text-xl font-bold mb-4">{editingSample ? '编辑样品' : '添加样品'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">型号</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">单位成本</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">重量(kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSample(null); }}
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

export default Samples;
