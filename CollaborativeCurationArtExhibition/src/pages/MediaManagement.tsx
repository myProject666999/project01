import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, FileText, Image, Download, Upload, ChevronRight } from 'lucide-react';
import useMediaStore from '@/stores/mediaStore';
import MediaForm from '@/components/MediaForm';
import type { MediaItem } from '@/stores/mediaStore';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  poster: <Image size={16} />,
  press_release: <FileText size={16} />,
  other: <FileText size={16} />,
};

const TYPE_LABELS: Record<string, string> = {
  poster: '海报',
  press_release: '通稿',
  other: '其他',
};

const TYPE_COLORS: Record<string, string> = {
  poster: '#c9a96e',
  press_release: '#6ea9c9',
  other: '#6ec9a9',
};

export default function MediaManagement() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const exId = Number(exhibitionId);
  const { mediaItems, versions, fetchByExhibition, fetchVersions, addVersion, create } = useMediaStore();

  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'poster' | 'press_release'>('poster');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [changeLog, setChangeLog] = useState('');

  useEffect(() => { fetchByExhibition(exId); }, [exId, fetchByExhibition]);

  useEffect(() => {
    if (selectedItem) {
      fetchVersions(exId, selectedItem.id);
    }
  }, [selectedItem, exId, fetchVersions]);

  const filteredItems = mediaItems.filter((item) => {
    if (activeTab === 'poster') return item.type === 'poster';
    return item.type === 'press_release';
  });

  const handleAddVersion = async () => {
    if (!selectedItem || !versionFile) return;
    await addVersion(exId, selectedItem.id, versionFile, changeLog);
    setVersionFile(null);
    setChangeLog('');
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#1a1a2e', color: '#f5f0eb' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>媒体物料</h1>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
            <Plus size={16} /> 上传物料
          </button>
        </div>

        <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: '#16162a' }}>
          {[
            { key: 'poster' as const, label: '海报管理' },
            { key: 'press_release' as const, label: '通稿管理' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedItem(null); }}
              className="px-6 py-2 rounded text-sm transition-colors"
              style={{
                background: activeTab === tab.key ? '#c9a96e' : 'transparent',
                color: activeTab === tab.key ? '#1a1a2e' : '#888',
                fontWeight: activeTab === tab.key ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {selectedItem ? (
              <div>
                <button onClick={() => setSelectedItem(null)}
                  className="flex items-center gap-1 text-sm mb-4 hover:underline" style={{ color: '#c9a96e' }}>
                  <ChevronRight size={14} className="rotate-180" /> 返回列表
                </button>
                <div className="rounded-lg p-6 mb-4" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${TYPE_COLORS[selectedItem.type]}22`, color: TYPE_COLORS[selectedItem.type] }}>
                        {TYPE_LABELS[selectedItem.type]}
                      </span>
                      <span className="text-xs ml-2" style={{ color: '#888' }}>当前版本: v{selectedItem.currentVersion}</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9a96e' }}>版本历史</h4>
                  <div className="space-y-3">
                    {versions.map((v) => (
                      <div key={v.id} className="flex items-start gap-3 pl-4 relative">
                        <div className="absolute left-0 top-2 w-2 h-2 rounded-full" style={{ background: '#c9a96e' }} />
                        <div className="flex-1 rounded px-4 py-3" style={{ background: '#1a1a2e' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">v{v.versionNumber}</span>
                            <span className="text-[10px]" style={{ color: '#666' }}>{new Date(v.createdAt).toLocaleString('zh-CN')}</span>
                          </div>
                          <div className="text-xs mt-1" style={{ color: '#888' }}>{v.fileName || '未命名文件'}</div>
                          {v.changeLog && <div className="text-xs mt-1" style={{ color: '#aaa' }}>{v.changeLog}</div>}
                          <a href={v.fileUrl}
                            className="inline-flex items-center gap-1 text-xs mt-2 hover:underline" style={{ color: '#c9a96e' }}>
                            <Download size={12} /> 下载
                          </a>
                        </div>
                      </div>
                    ))}
                    {versions.length === 0 && <div className="text-xs py-4 text-center" style={{ color: '#666' }}>暂无版本记录</div>}
                  </div>

                  <div className="mt-6 pt-4" style={{ borderTop: '1px solid #2a2a4e' }}>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9a96e' }}>上传新版本</h4>
                    <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-white/5 mb-2"
                      style={{ border: '1px dashed #2a2a4e' }}>
                      <Upload size={14} style={{ color: '#888' }} />
                      <span className="text-sm" style={{ color: versionFile ? '#f5f0eb' : '#666' }}>{versionFile?.name || '选择文件...'}</span>
                      <input type="file" className="hidden" onChange={(e) => setVersionFile(e.target.files?.[0] || null)} />
                    </label>
                    <textarea value={changeLog} onChange={(e) => setChangeLog(e.target.value)} rows={2} placeholder="变更说明..."
                      className="w-full px-3 py-2 rounded text-sm outline-none resize-none mb-2"
                      style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                    />
                    <button onClick={handleAddVersion} disabled={!versionFile}
                      className="px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                      style={{ background: '#c9a96e', color: '#1a1a2e' }}>
                      上传新版本
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={item.id} onClick={() => setSelectedItem(item)}
                    className="rounded-lg p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
                    <div className="w-full h-32 rounded mb-3 flex items-center justify-center" style={{ background: '#0d0d1a' }}>
                      <div style={{ color: TYPE_COLORS[item.type] }}>{TYPE_ICONS[item.type]}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${TYPE_COLORS[item.type]}22`, color: TYPE_COLORS[item.type] }}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#888' }}>版本: v{item.currentVersion}</div>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-sm" style={{ color: '#666' }}>暂无{activeTab === 'poster' ? '海报' : '通稿'}物料</div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg p-4" style={{ background: '#1e1e38', border: '1px solid #2a2a4e' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: '#c9a96e', fontFamily: 'Playfair Display' }}>版本对比</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded p-4 text-center" style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}>
                <div className="text-xs mb-2" style={{ color: '#888' }}>版本 A</div>
                <div className="h-24 flex items-center justify-center" style={{ color: '#333' }}>
                  {TYPE_ICONS[selectedItem?.type || 'poster']}
                </div>
              </div>
              <div className="rounded p-4 text-center" style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}>
                <div className="text-xs mb-2" style={{ color: '#888' }}>版本 B</div>
                <div className="h-24 flex items-center justify-center" style={{ color: '#333' }}>
                  {TYPE_ICONS[selectedItem?.type || 'poster']}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center mt-3" style={{ color: '#666' }}>选择两个版本进行对比</p>
          </div>
        </div>
      </div>

      <MediaForm open={formOpen} onClose={() => setFormOpen(false)}
        onSubmit={(data, file) => create(exId, data, file)} />
    </div>
  );
}
