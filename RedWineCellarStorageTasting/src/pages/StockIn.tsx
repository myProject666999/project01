import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';
import { useWineStore } from '@/stores/wineStore';
import { useCellarStore, type CellarSlot } from '@/stores/cellarStore';

export default function StockIn() {
  const { wines, fetchWines } = useWineStore();
  const { availableSlots, fetchAvailableSlots, stockIn } = useCellarStore();
  const navigate = useNavigate();

  const [wineId, setWineId] = useState<number | ''>('');
  const [slotId, setSlotId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWines();
    fetchAvailableSlots();
  }, []);

  const handleStockIn = async () => {
    if (!wineId || !slotId) return;
    setSaving(true);
    try {
      await stockIn(Number(wineId), slotId, date);
      navigate('/cellar');
    } catch {
      setSaving(false);
    }
  };

  const grouped = availableSlots.reduce<Record<number, CellarSlot[]>>((acc, slot) => {
    if (!acc[slot.rackNo]) acc[slot.rackNo] = [];
    acc[slot.rackNo].push(slot);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">酒款入库</h1>
        <p className="text-gray-400 font-body mt-1">将酒瓶放入酒窖</p>
      </div>

      <div className="glass-effect rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 font-body mb-1.5">选择酒款</label>
          <div className="flex gap-3">
            <select
              value={wineId}
              onChange={(e) => setWineId(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 px-4 py-2.5 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
            >
              <option value="">请选择酒款...</option>
              {wines.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.chateau} {w.vintage} — {w.region}
                </option>
              ))}
            </select>
            <button
              onClick={() => navigate('/wines/new')}
              className="flex items-center gap-2 px-4 py-2.5 bg-burgundy/20 border border-burgundy/30 text-gold rounded-lg font-body text-sm hover:bg-burgundy/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 font-body mb-1.5">选择窖位</label>
          {Object.keys(grouped).length === 0 ? (
            <p className="text-gray-500 font-body text-sm">无可用窖位</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([rack, slots]) => (
                <div key={rack} className="bg-cellar-dark/60 rounded-lg p-4">
                  <h4 className="font-display text-sm text-gold mb-3">Rack {rack}</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSlotId(slot.id)}
                        className={`p-2 rounded text-xs font-body text-center transition-all ${
                          slotId === slot.id
                            ? 'bg-gold text-cellar-dark font-medium'
                            : 'bg-cellar-dark border border-gold/10 text-gray-400 hover:border-gold/40 hover:text-gold'
                        }`}
                      >
                        L{slot.layerNo}P{slot.positionNo}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 font-body mb-1.5">入库日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gold/10">
          <button
            onClick={handleStockIn}
            disabled={!wineId || !slotId || saving}
            className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/80 text-gold px-6 py-2.5 rounded-lg font-body text-sm transition-colors shadow-lg shadow-burgundy/20 disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            {saving ? '处理中...' : '确认入库'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gold/10 text-gray-400 hover:text-gold hover:border-gold/30 font-body text-sm transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
