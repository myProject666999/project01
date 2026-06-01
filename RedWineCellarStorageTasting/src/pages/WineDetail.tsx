import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Percent, DollarSign, Calendar, Wine } from 'lucide-react';
import { useWineStore } from '@/stores/wineStore';
import { useTastingStore } from '@/stores/tastingStore';
import TastingChart from '@/components/TastingChart';

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

export default function WineDetail() {
  const { id } = useParams<{ id: string }>();
  const { current, fetchWine, loading } = useWineStore();
  const { list: tastingNotes, fetchByWine } = useTastingStore();

  useEffect(() => {
    if (id) {
      fetchWine(Number(id));
      fetchByWine(Number(id));
    }
  }, [id]);

  if (loading || !current) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const status = getDrinkStatus(current);

  const chartData = tastingNotes
    .slice()
    .sort((a, b) => new Date(a.tastingDate).getTime() - new Date(b.tastingDate).getTime())
    .map((n) => ({ date: n.tastingDate, score: n.overallScore }));

  return (
    <div className="space-y-6">
      <Link
        to="/wines"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-gold font-body text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回酒款列表
      </Link>

      <div className="glass-effect rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl text-gold text-shadow-gold">
              {current.chateau}
            </h1>
            <p className="text-gray-400 font-body text-lg mt-1">
              {current.vintage} · {current.region}
            </p>
          </div>
          <span className={`text-sm px-3 py-1.5 rounded-full font-body font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cellar-dark/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-body text-xs">产区</span>
            </div>
            <p className="font-display text-white text-sm">{current.region}</p>
          </div>
          <div className="bg-cellar-dark/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Percent className="w-3.5 h-3.5" />
              <span className="font-body text-xs">酒精度</span>
            </div>
            <p className="font-display text-white text-sm">{current.abv}%</p>
          </div>
          <div className="bg-cellar-dark/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-body text-xs">适饮期</span>
            </div>
            <p className="font-display text-white text-sm">
              {current.drinkFrom} – {current.drinkTo}
            </p>
          </div>
          <div className="bg-cellar-dark/60 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Wine className="w-3.5 h-3.5" />
              <span className="font-body text-xs">瓶数</span>
            </div>
            <p className="font-display text-white text-sm">{current.bottleCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h2 className="font-display text-xl text-gold mb-4">葡萄品种</h2>
          <div className="space-y-3">
            {current.grapeVarieties.map((g, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-cellar-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-burgundy to-gold rounded-full"
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
                <span className="text-gray-300 font-body text-sm w-32">{g.name}</span>
                <span className="text-gold font-body text-sm w-10 text-right">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h2 className="font-display text-xl text-gold mb-4">价格</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cellar-dark/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-body text-xs">购入价</span>
              </div>
              <p className="font-display text-2xl text-white">
                ¥{current.purchasePrice}
              </p>
            </div>
            <div className="bg-cellar-dark/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-2">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-body text-xs">市价</span>
              </div>
              <p className="font-display text-2xl text-gold">
                ¥{current.marketPrice}
              </p>
            </div>
          </div>
          {current.marketPrice > current.purchasePrice && (
            <div className="mt-4 text-center">
              <span className="text-green-400 font-body text-sm">
                ↑ {(((current.marketPrice - current.purchasePrice) / current.purchasePrice) * 100).toFixed(1)}% 增值
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="glass-effect rounded-xl p-6">
        <h2 className="font-display text-xl text-gold mb-4">品鉴轨迹</h2>
        <TastingChart data={chartData} />
      </div>

      <div className="glass-effect rounded-xl p-6">
        <h2 className="font-display text-xl text-gold mb-4">品鉴笔记</h2>
        {tastingNotes.length === 0 ? (
          <p className="text-gray-500 font-body text-sm">暂无品鉴记录</p>
        ) : (
          <div className="space-y-4">
            {tastingNotes
              .slice()
              .sort((a, b) => new Date(b.tastingDate).getTime() - new Date(a.tastingDate).getTime())
              .map((note) => (
                <div
                  key={note.id}
                  className="bg-cellar-dark/60 rounded-lg p-4 border border-gold/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-body text-sm">
                      {new Date(note.tastingDate).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-display text-gold text-lg">{note.overallScore}/100</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-body">外观</p>
                      <p className="text-sm text-white font-body">{note.appearanceScore}/20</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-body">香气</p>
                      <p className="text-sm text-white font-body">{note.aromaScore}/30</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-body">口感</p>
                      <p className="text-sm text-white font-body">{note.tasteScore}/40</p>
                    </div>
                  </div>
                  {note.notes && (
                    <p className="text-gray-400 font-body text-sm mt-2">{note.notes}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
