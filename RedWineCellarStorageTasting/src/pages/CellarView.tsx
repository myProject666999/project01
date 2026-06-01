import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse } from 'lucide-react';
import { useCellarStore, type CellarSlot as CellarSlotType } from '@/stores/cellarStore';
import CellarSlotComponent from '@/components/CellarSlot';

export default function CellarView() {
  const { slots, layout, fetchSlots, fetchLayout } = useCellarStore();
  const [selectedSlot, setSelectedSlot] = useState<CellarSlotType | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
    fetchLayout();
  }, []);

  const racks = Array.from({ length: layout.totalRacks }, (_, r) => r);
  const layers = Array.from({ length: layout.layersPerRack }, (_, l) => l);
  const positions = Array.from({ length: layout.positionsPerLayer }, (_, p) => p);

  const svgW = layout.positionsPerLayer * 52 + 20;
  const svgH = layout.layersPerRack * 34 + 20;

  const statusCounts = {
    occupied: slots.filter((s) => s.status === 'occupied').length,
    approaching: slots.filter((s) => s.status === 'approaching').length,
    overdue: slots.filter((s) => s.status === 'overdue').length,
    empty: slots.filter((s) => s.status === 'empty').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold text-shadow-gold">窖位视图</h1>
          <p className="text-gray-400 font-body mt-1">等轴测窖位可视化</p>
        </div>
      </div>

      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#374151' }} />
            <span className="text-gray-400 font-body text-sm">空位 ({statusCounts.empty})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-burgundy" />
            <span className="text-gray-400 font-body text-sm">已占 ({statusCounts.occupied})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D97706' }} />
            <span className="text-gray-400 font-body text-sm">即将到期 ({statusCounts.approaching})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }} />
            <span className="text-gray-400 font-body text-sm">已过期 ({statusCounts.overdue})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gold" />
            <span className="text-gray-400 font-body text-sm">选中</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {racks.map((rack) => {
            const rackSlots = slots.filter((s) => s.rackNo === rack + 1);

            return (
              <div key={rack} className="glass-effect rounded-xl p-4">
                <h3 className="font-display text-lg text-gold text-center mb-3">
                  架 {rack + 1}
                </h3>
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full"
                  style={{ maxWidth: svgW }}
                >
                  {layers.map((layer) =>
                    positions.map((position) => {
                      const slot = rackSlots.find(
                        (s) => s.layerNo === layer + 1 && s.positionNo === position + 1
                      );
                      const slotData: CellarSlotType = slot || {
                        id: -(rack * 100 + layer * 10 + position),
                        rackNo: rack + 1,
                        layerNo: layer + 1,
                        positionNo: position + 1,
                        wineId: null,
                        status: 'empty',
                      };

                      return (
                        <CellarSlotComponent
                          key={`${rack}-${layer}-${position}`}
                          rack={rack + 1}
                          layer={layer}
                          position={position}
                          status={slotData.status}
                          wine={slotData.wine || undefined}
                          selected={selectedSlot?.id === slotData.id}
                          onClick={() => {
                            setSelectedSlot(slotData);
                            if (slotData.wineId) {
                              navigate(`/wines/${slotData.wineId}`);
                            }
                          }}
                        />
                      );
                    })
                  )}
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSlot && (
        <div className="glass-effect rounded-xl p-6">
          <h2 className="font-display text-xl text-gold mb-3">选中窖位</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cellar-dark/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-body">架</p>
              <p className="text-white font-display">{selectedSlot.rackNo}</p>
            </div>
            <div className="bg-cellar-dark/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-body">层</p>
              <p className="text-white font-display">{selectedSlot.layerNo}</p>
            </div>
            <div className="bg-cellar-dark/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-body">位</p>
              <p className="text-white font-display">{selectedSlot.positionNo}</p>
            </div>
            <div className="bg-cellar-dark/60 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-body">状态</p>
              <p className="font-display capitalize" style={{
                color: selectedSlot.status === 'occupied' ? '#722F37' :
                       selectedSlot.status === 'approaching' ? '#D97706' :
                       selectedSlot.status === 'overdue' ? '#DC2626' : '#6b7280'
              }}>
                {selectedSlot.status === 'occupied' ? '已占' :
                       selectedSlot.status === 'approaching' ? '即将到期' :
                       selectedSlot.status === 'overdue' ? '已过期' : '空位'}
              </p>
            </div>
          </div>
          {selectedSlot.wine && (
            <div className="mt-3 p-3 bg-burgundy/20 rounded-lg border border-gold/10">
              <p className="text-gold font-display">{selectedSlot.wine.chateau} {selectedSlot.wine.vintage}</p>
              <p className="text-gray-400 font-body text-sm">{selectedSlot.wine.region}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
