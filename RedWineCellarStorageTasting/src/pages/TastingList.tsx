import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Star } from 'lucide-react';
import { useTastingStore } from '@/stores/tastingStore';

export default function TastingList() {
  const { list, loading, fetchAll } = useTastingStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const grouped = list.reduce<Record<string, typeof list>>((acc, note) => {
    const key = note.wine
      ? `${note.wine.chateau} ${note.wine.vintage}`
      : `Wine #${note.wineId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold text-shadow-gold">品鉴笔记</h1>
          <p className="text-gray-400 font-body mt-1">品鉴历史记录</p>
        </div>
        <Link
          to="/tasting/new"
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/80 text-gold px-5 py-2.5 rounded-lg font-body text-sm transition-colors shadow-lg shadow-burgundy/20"
        >
          <Clapperboard className="w-4 h-4" />
          新增品鉴
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="glass-effect rounded-xl p-12 text-center">
          <Clapperboard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-body">暂无品鉴记录</p>
          <p className="text-gray-500 font-body text-sm mt-1">记录您的第一次品鉴体验</p>
          <Link
            to="/tasting/new"
            className="inline-flex items-center gap-2 mt-4 bg-burgundy hover:bg-burgundy/80 text-gold px-5 py-2 rounded-lg font-body text-sm transition-colors"
          >
            <Clapperboard className="w-4 h-4" />
            新增品鉴
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([wineName, notes]) => (
            <div key={wineName} className="glass-effect rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl text-gold">{wineName}</h2>
                <span className="text-gray-500 font-body text-sm">({notes.length} 条)</span>
              </div>
              <div className="space-y-3">
                {notes
                  .slice()
                  .sort((a, b) => new Date(b.tastingDate).getTime() - new Date(a.tastingDate).getTime())
                  .map((note) => (
                    <Link
                      key={note.id}
                      to={`/wines/${note.wineId}`}
                      className="block bg-cellar-dark/60 rounded-lg p-4 border border-gold/5 hover:border-gold/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 font-body text-sm">
                          {new Date(note.tastingDate).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-gold text-lg">{note.overallScore}</span>
                          <span className="text-gray-500 font-body text-sm">/100</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 font-body">外观</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex-1 h-1.5 bg-cellar-dark rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold/60 rounded-full"
                                style={{ width: `${(note.appearanceScore / 20) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 font-body">{note.appearanceScore}/20</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-body">Aroma</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex-1 h-1.5 bg-cellar-dark rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold/60 rounded-full"
                                style={{ width: `${(note.aromaScore / 30) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 font-body">{note.aromaScore}/30</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-body">Taste</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="flex-1 h-1.5 bg-cellar-dark rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold/60 rounded-full"
                                style={{ width: `${(note.tasteScore / 40) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 font-body">{note.tasteScore}/40</span>
                          </div>
                        </div>
                      </div>
                      {note.notes && (
                        <p className="text-gray-500 font-body text-xs mt-2 line-clamp-2">{note.notes}</p>
                      )}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
