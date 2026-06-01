import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Edit3, Check, X, DollarSign, Package } from 'lucide-react';
import { useValuationStore, type ValuationDetail } from '@/stores/valuationStore';

function formatCurrency(val: number) {
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Valuation() {
  const { summary, details, loading, fetchSummary, fetchDetails, updateMarketPrice } =
    useValuationStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchSummary();
    fetchDetails();
  }, []);

  const startEdit = (detail: ValuationDetail) => {
    setEditingId(detail.wineId);
    setEditValue(String(detail.marketPrice));
  };

  const saveEdit = async (wineId: number) => {
    const price = Number(editValue);
    if (isNaN(price) || price < 0) return;
    await updateMarketPrice(wineId, price);
    setEditingId(null);
    fetchSummary();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">Valuation</h1>
        <p className="text-gray-400 font-body mt-1">Your cellar's value at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Package className="w-4 h-4" />
            <span className="font-body text-sm">Total Bottles</span>
          </div>
          <p className="font-display text-3xl text-white">{summary.totalBottles}</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-body text-sm">Purchase Cost</span>
          </div>
          <p className="font-display text-3xl text-white">
            {formatCurrency(summary.totalPurchaseCost)}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="font-body text-sm">Market Value</span>
          </div>
          <p className="font-display text-3xl text-gold">
            {formatCurrency(summary.totalMarketValue)}
          </p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            {summary.appreciationRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="font-body text-sm">Appreciation</span>
          </div>
          <p
            className={`font-display text-3xl ${
              summary.appreciationRate >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {summary.appreciationRate >= 0 ? '+' : ''}
            {summary.appreciationRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass-effect rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10">
                  <th className="text-left px-6 py-4 text-sm font-body text-gray-500 font-medium">Wine</th>
                  <th className="text-center px-4 py-4 text-sm font-body text-gray-500 font-medium">Bottles</th>
                  <th className="text-right px-4 py-4 text-sm font-body text-gray-500 font-medium">Purchase</th>
                  <th className="text-right px-4 py-4 text-sm font-body text-gray-500 font-medium">Market</th>
                  <th className="text-right px-4 py-4 text-sm font-body text-gray-500 font-medium">Total Cost</th>
                  <th className="text-right px-4 py-4 text-sm font-body text-gray-500 font-medium">Total Value</th>
                  <th className="text-center px-4 py-4 text-sm font-body text-gray-500 font-medium">Change</th>
                  <th className="text-center px-4 py-4 text-sm font-body text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => (
                  <tr
                    key={detail.wineId}
                    className="border-b border-gold/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-display text-sm text-white">{detail.chateau}</p>
                      <p className="text-xs text-gray-500 font-body">
                        {detail.vintage} · {detail.region}
                      </p>
                    </td>
                    <td className="text-center px-4 py-4 text-sm text-gray-300 font-body">
                      {detail.bottleCount}
                    </td>
                    <td className="text-right px-4 py-4 text-sm text-gray-300 font-body">
                      ${detail.purchasePrice}
                    </td>
                    <td className="text-right px-4 py-4">
                      {editingId === detail.wineId ? (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 px-2 py-1 bg-cellar-dark border border-gold/20 rounded text-gray-200 font-body text-sm text-right focus:outline-none focus:border-gold/40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(detail.wineId);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button
                            onClick={() => saveEdit(detail.wineId)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gold font-body">${detail.marketPrice}</span>
                      )}
                    </td>
                    <td className="text-right px-4 py-4 text-sm text-gray-300 font-body">
                      {formatCurrency(detail.totalPurchaseCost)}
                    </td>
                    <td className="text-right px-4 py-4 text-sm text-gold font-body font-medium">
                      {formatCurrency(detail.totalMarketValue)}
                    </td>
                    <td className="text-center px-4 py-4">
                      <span
                        className={`text-sm font-body font-medium ${
                          detail.appreciationRate >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {detail.appreciationRate >= 0 ? '+' : ''}
                        {detail.appreciationRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-4 py-4">
                      {editingId !== detail.wineId && (
                        <button
                          onClick={() => startEdit(detail)}
                          className="text-gray-500 hover:text-gold transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
