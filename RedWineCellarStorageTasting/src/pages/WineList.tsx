import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Wine } from 'lucide-react';
import { useWineStore, type WineFilters } from '@/stores/wineStore';

function getDrinkStatus(wine: { drinkFrom: number; drinkTo: number }): {
  label: string;
  color: string;
} {
  const now = new Date().getFullYear();
  if (now > wine.drinkTo) return { label: '已过巅峰', color: 'bg-red-600/80 text-red-100' };
  if (now >= wine.drinkFrom && now <= wine.drinkTo)
    return { label: '适饮中', color: 'bg-green-600/80 text-green-100' };
  if (now >= wine.drinkFrom - 3) return { label: '即将适饮', color: 'bg-amber-600/80 text-amber-100' };
  return { label: '尚需陈年', color: 'bg-blue-600/80 text-blue-100' };
}

export default function WineList() {
  const { wines, filters, loading, fetchWines, setFilters } = useWineStore();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWines(filters);
  }, [filters]);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
  };

  const uniqueRegions = [...new Set(wines.map((w) => w.region))];
  const uniqueChateaux = [...new Set(wines.map((w) => w.chateau))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold text-shadow-gold">酒款</h1>
          <p className="text-gray-400 font-body mt-1">您的藏酒</p>
        </div>
        <Link
          to="/wines/new"
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/80 text-gold px-5 py-2.5 rounded-lg font-body text-sm transition-colors shadow-lg shadow-burgundy/20"
        >
          <Plus className="w-4 h-4" />
          新增酒款
        </Link>
      </div>

      <div className="glass-effect rounded-xl p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索酒款名称、酒庄、产区..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-body text-sm transition-colors ${
              showFilters
                ? 'border-gold/40 text-gold bg-burgundy/20'
                : 'border-gold/10 text-gray-400 hover:text-gold hover:border-gold/30'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gold/10">
            <select
              value={filters.region || ''}
              onChange={(e) => setFilters({ ...filters, region: e.target.value || undefined })}
              className="bg-cellar-dark/80 border border-gold/10 rounded-lg px-3 py-2 text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
            >
              <option value="">所有产区</option>
              {uniqueRegions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={filters.chateau || ''}
              onChange={(e) => setFilters({ ...filters, chateau: e.target.value || undefined })}
              className="bg-cellar-dark/80 border border-gold/10 rounded-lg px-3 py-2 text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
            >
              <option value="">所有酒庄</option>
              {uniqueChateaux.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filters.drinkStatus || ''}
              onChange={(e) => setFilters({ ...filters, drinkStatus: e.target.value || undefined })}
              className="bg-cellar-dark/80 border border-gold/10 rounded-lg px-3 py-2 text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
            >
              <option value="">所有状态</option>
              <option value="drink-now">适饮中</option>
              <option value="approaching">即将适饮</option>
              <option value="too-young">尚需陈年</option>
              <option value="past-peak">已过巅峰</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : wines.length === 0 ? (
        <div className="glass-effect rounded-xl p-12 text-center">
          <Wine className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-body">未找到酒款</p>
          <p className="text-gray-500 font-body text-sm mt-1">
            添加您的第一瓶酒开始管理
          </p>
          <Link
            to="/wines/new"
            className="inline-flex items-center gap-2 mt-4 bg-burgundy hover:bg-burgundy/80 text-gold px-5 py-2 rounded-lg font-body text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加酒款
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wines.map((wine) => {
            const status = getDrinkStatus(wine);
            return (
              <div
                key={wine.id}
                onClick={() => navigate(`/wines/${wine.id}`)}
                className="glass-effect rounded-xl p-5 hover:border-gold/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-gold/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg text-white group-hover:text-gold transition-colors">
                      {wine.chateau}
                    </h3>
                    <p className="text-gray-400 font-body text-sm">
                      {wine.vintage} · {wine.region}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-body font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {wine.grapeVarieties.map((g, i) => (
                    <span
                      key={i}
                      className="text-xs bg-cellar-dark/80 text-gray-400 px-2 py-0.5 rounded font-body"
                    >
                      {g.name} {g.percentage}%
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                  <div className="flex items-center gap-1">
                    <span className="text-gold font-display text-lg">
                      ¥{wine.marketPrice}
                    </span>
                    <span className="text-gray-500 font-body text-xs">市价</span>
                  </div>
                  <span className="text-sm text-gray-400 font-body">
                    {wine.bottleCount} 瓶
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
