import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  ZoomIn, ZoomOut, RotateCcw, Save, Upload, FileDown, GripVertical,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import useFloorplanStore from '@/stores/floorplanStore';
import type { ArtworkLayout, Artwork } from '@/stores/floorplanStore';

const SNAP_THRESHOLD = 5;
const DEFAULT_W = 120;
const DEFAULT_H = 80;

interface DragState {
  isDragging: boolean;
  artworkId: number | null;
  startMouseX: number;
  startMouseY: number;
  startArtworkX: number;
  startArtworkY: number;
}

interface AlignmentGuide {
  axis: 'x' | 'y';
  position: number;
  start: number;
  end: number;
}

function computeGuides(dragging: ArtworkLayout, others: ArtworkLayout[]): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const a = dragging;
  const aL = a.x, aR = a.x + a.width, aCx = a.x + a.width / 2;
  const aT = a.y, aB = a.y + a.height, aCy = a.y + a.height / 2;

  for (const b of others) {
    const bL = b.x, bR = b.x + b.width, bCx = b.x + b.width / 2;
    const bT = b.y, bB = b.y + b.height, bCy = b.y + b.height / 2;

    if (Math.abs(aL - bL) < SNAP_THRESHOLD)
      guides.push({ axis: 'x', position: bL, start: Math.min(aT, bT), end: Math.max(aB, bB) });
    if (Math.abs(aR - bR) < SNAP_THRESHOLD)
      guides.push({ axis: 'x', position: bR, start: Math.min(aT, bT), end: Math.max(aB, bB) });
    if (Math.abs(aCx - bCx) < SNAP_THRESHOLD)
      guides.push({ axis: 'x', position: bCx, start: Math.min(aT, bT), end: Math.max(aB, bB) });
    if (Math.abs(aT - bT) < SNAP_THRESHOLD)
      guides.push({ axis: 'y', position: bT, start: Math.min(aL, bL), end: Math.max(aR, bR) });
    if (Math.abs(aB - bB) < SNAP_THRESHOLD)
      guides.push({ axis: 'y', position: bB, start: Math.min(aL, bL), end: Math.max(aR, bR) });
    if (Math.abs(aCy - bCy) < SNAP_THRESHOLD)
      guides.push({ axis: 'y', position: bCy, start: Math.min(aL, bL), end: Math.max(aR, bR) });
  }
  return guides;
}

export default function FloorPlanEditor() {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const exId = Number(exhibitionId);
  const { floorplan, artworks, fetch, update, uploadBackground, loading } = useFloorplanStore();

  const [layoutItems, setLayoutItems] = useState<ArtworkLayout[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const [saving, setSaving] = useState(false);

  const dragRef = useRef<DragState>({
    isDragging: false, artworkId: null, startMouseX: 0, startMouseY: 0, startArtworkX: 0, startArtworkY: 0,
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch(exId); }, [exId, fetch]);

  useEffect(() => {
    if (floorplan?.layoutData?.artworks) {
      setLayoutItems(floorplan.layoutData.artworks);
    }
  }, [floorplan?.layoutData]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); setSpaceHeld(true); }
  }, []);
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') setSpaceHeld(false);
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [handleKeyDown, handleKeyUp]);

  const getSvgPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  };

  const handleArtworkMouseDown = (e: React.MouseEvent, artworkId: number) => {
    if (spaceHeld || e.button === 1) return;
    e.stopPropagation();
    const item = layoutItems.find((a) => a.artworkId === artworkId);
    if (!item) return;
    setSelectedId(artworkId);
    const svgPt = getSvgPoint(e.clientX, e.clientY);
    dragRef.current = {
      isDragging: true, artworkId, startMouseX: svgPt.x, startMouseY: svgPt.y, startArtworkX: item.x, startArtworkY: item.y,
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan((prev) => ({
        x: prev.x + (e.clientX - panStart.x),
        y: prev.y + (e.clientY - panStart.y),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const drag = dragRef.current;
    if (!drag.isDragging || !drag.artworkId) return;
    const svgPt = getSvgPoint(e.clientX, e.clientY);
    const dx = svgPt.x - drag.startMouseX;
    const dy = svgPt.y - drag.startMouseY;
    const newX = drag.startArtworkX + dx;
    const newY = drag.startArtworkY + dy;

    setLayoutItems((prev) => {
      const updated = prev.map((a) =>
        a.artworkId === drag.artworkId ? { ...a, x: newX, y: newY } : a
      );
      const dragging = updated.find((a) => a.artworkId === drag.artworkId);
      const others = updated.filter((a) => a.artworkId !== drag.artworkId);
      if (dragging) {
        setGuides(computeGuides(dragging, others));
      }
      return updated;
    });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) { setIsPanning(false); return; }
    dragRef.current = { isDragging: false, artworkId: null, startMouseX: 0, startMouseY: 0, startArtworkX: 0, startArtworkY: 0 };
    setGuides([]);
  }, [isPanning]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (spaceHeld || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (e.target === svgRef.current || (e.target as Element).classList?.contains('canvas-bg')) {
      setSelectedId(null);
    }
  };

  const handleZoom = (delta: number) => setZoom((z) => Math.min(Math.max(z + delta, 0.25), 3));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleSave = async () => {
    setSaving(true);
    await update(exId, { layoutData: { artworks: layoutItems } });
    setSaving(false);
  };

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: '#1a1a2e', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save('floor-plan.pdf');
  };

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadBackground(exId, file);
  };

  const handleAddToCanvas = (artwork: Artwork) => {
    const exists = layoutItems.find((l) => l.artworkId === artwork.id);
    if (exists) { setSelectedId(artwork.id); return; }
    const newItem: ArtworkLayout = {
      artworkId: artwork.id, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      rotation: 0, width: DEFAULT_W, height: DEFAULT_H,
    };
    setLayoutItems((prev) => [...prev, newItem]);
    setSelectedId(artwork.id);
  };

  const selectedItem = layoutItems.find((a) => a.artworkId === selectedId);

  const updateSelectedItem = (field: keyof ArtworkLayout, value: number) => {
    if (!selectedId) return;
    setLayoutItems((prev) => prev.map((a) => a.artworkId === selectedId ? { ...a, [field]: value } : a));
  };

  const artworkColors = ['#8b5e3c', '#4a6741', '#5b4a8a', '#8a4a4a', '#4a6a8a', '#8a7a4a'];

  if (loading && !floorplan) {
    return <div className="h-screen flex items-center justify-center" style={{ background: '#1a1a2e', color: '#f5f0eb' }}>加载中...</div>;
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#1a1a2e', color: '#f5f0eb' }}>
      <div className="flex items-center gap-3 px-4 py-2 border-b" style={{ borderColor: '#2a2a4e', background: '#16162a' }}>
        <span className="font-semibold text-sm mr-2" style={{ fontFamily: 'Playfair Display', color: '#c9a96e' }}>
          平面图编辑器
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => handleZoom(0.1)} className="p-1.5 rounded hover:bg-white/10"><ZoomIn size={16} /></button>
          <span className="text-xs w-14 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => handleZoom(-0.1)} className="p-1.5 rounded hover:bg-white/10"><ZoomOut size={16} /></button>
          <button onClick={resetView} className="p-1.5 rounded hover:bg-white/10"><RotateCcw size={16} /></button>
        </div>
        <div className="flex-1" />
        <label className="flex items-center gap-1 px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-white/10" style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}>
          <Upload size={14} /> 上传底图
          <input type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
        </label>
        <button onClick={handleExportPDF} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs hover:bg-white/10" style={{ border: '1px solid #3a3a5e' }}>
          <FileDown size={14} /> 导出PDF
        </button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 rounded text-xs font-medium" style={{ background: '#c9a96e', color: '#1a1a2e' }}>
          <Save size={14} /> {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r flex flex-col overflow-hidden" style={{ borderColor: '#2a2a4e', background: '#16162a' }}>
          <div className="p-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#c9a96e', fontFamily: 'Playfair Display' }}>
            展品列表
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {artworks.map((artwork) => {
              const placed = layoutItems.find((l) => l.artworkId === artwork.id);
              return (
                <div
                  key={artwork.id}
                  onClick={() => handleAddToCanvas(artwork)}
                  className="flex items-center gap-2 px-2 py-2 mb-1 rounded cursor-pointer hover:bg-white/5 transition-colors"
                  style={{ border: placed ? '1px solid #c9a96e44' : '1px solid transparent' }}
                >
                  <GripVertical size={14} style={{ color: '#666' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{artwork.title}</div>
                    {artwork.medium && <div className="text-[10px] truncate" style={{ color: '#888' }}>{artwork.medium}</div>}
                  </div>
                  {placed && <span className="text-[10px] px-1 rounded" style={{ background: '#c9a96e22', color: '#c9a96e' }}>已放置</span>}
                </div>
              );
            })}
            {artworks.length === 0 && <div className="text-xs text-center py-4" style={{ color: '#666' }}>暂无展品</div>}
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative" ref={canvasRef}>
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ cursor: spaceHeld || isPanning ? 'grab' : 'default' }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2a4e" strokeWidth="0.5" />
              </pattern>
            </defs>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <rect className="canvas-bg" x="-5000" y="-5000" width="10000" height="10000" fill="#1a1a2e" />
              <rect className="canvas-bg" x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />
              {floorplan?.backgroundUrl && (
                <image
                  href={floorplan.backgroundUrl}
                  x={0} y={0} width={1200} height={800}
                  opacity={0.4}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {layoutItems.map((item, idx) => {
                const artwork = artworks.find((a) => a.id === item.artworkId);
                const isSelected = item.artworkId === selectedId;
                const color = artworkColors[idx % artworkColors.length];
                return (
                  <g
                    key={item.artworkId}
                    transform={`translate(${item.x}, ${item.y}) rotate(${item.rotation}, ${item.width / 2}, ${item.height / 2})`}
                    onMouseDown={(e) => handleArtworkMouseDown(e, item.artworkId)}
                    style={{ cursor: spaceHeld ? 'grab' : 'move' }}
                  >
                    <rect
                      width={item.width} height={item.height}
                      rx={4} fill={color} fillOpacity={0.85}
                      stroke={isSelected ? '#c9a96e' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                    <text
                      x={item.width / 2} y={item.height / 2}
                      textAnchor="middle" dominantBaseline="central"
                      fill="#f5f0eb" fontSize={11} fontWeight={500}
                    >
                      {artwork?.title || `#${item.artworkId}`}
                    </text>
                    {isSelected && (
                      <circle
                        cx={item.width / 2} cy={-12} r={6}
                        fill="#c9a96e" stroke="#1a1a2e" strokeWidth={1.5}
                        style={{ cursor: 'crosshair' }}
                      />
                    )}
                  </g>
                );
              })}
              {guides.map((g, i) => {
                if (g.axis === 'x') {
                  return <line key={i} x1={g.position} y1={g.start - 10} x2={g.position} y2={g.end + 10} stroke="#c9a96e" strokeWidth={1} strokeDasharray="4 3" />;
                }
                return <line key={i} x1={g.start - 10} y1={g.position} x2={g.end + 10} y2={g.position} stroke="#c9a96e" strokeWidth={1} strokeDasharray="4 3" />;
              })}
            </g>
          </svg>
        </div>

        <div className="w-60 border-l flex flex-col overflow-hidden" style={{ borderColor: '#2a2a4e', background: '#16162a' }}>
          <div className="p-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#c9a96e', fontFamily: 'Playfair Display' }}>
            属性面板
          </div>
          {selectedItem ? (
            <div className="px-3 space-y-3">
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>X 坐标</label>
                <input type="number" value={Math.round(selectedItem.x)}
                  onChange={(e) => updateSelectedItem('x', Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>Y 坐标</label>
                <input type="number" value={Math.round(selectedItem.y)}
                  onChange={(e) => updateSelectedItem('y', Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>旋转角度</label>
                <input type="number" value={selectedItem.rotation}
                  onChange={(e) => updateSelectedItem('rotation', Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded text-xs outline-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>宽度</label>
                  <input type="number" value={selectedItem.width}
                    onChange={(e) => updateSelectedItem('width', Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded text-xs outline-none"
                    style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>高度</label>
                  <input type="number" value={selectedItem.height}
                    onChange={(e) => updateSelectedItem('height', Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded text-xs outline-none"
                    style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase block mb-1" style={{ color: '#888' }}>备注</label>
                <textarea rows={2}
                  placeholder="添加备注..."
                  className="w-full px-2 py-1.5 rounded text-xs outline-none resize-none"
                  style={{ background: '#1a1a2e', border: '1px solid #2a2a4e', color: '#f5f0eb' }}
                />
              </div>
              <button
                onClick={() => {
                  setLayoutItems((prev) => prev.filter((a) => a.artworkId !== selectedId));
                  setSelectedId(null);
                }}
                className="w-full py-1.5 rounded text-xs"
                style={{ background: '#4a2020', color: '#ff8888' }}
              >
                移除展品
              </button>
            </div>
          ) : (
            <div className="px-3 text-xs" style={{ color: '#666' }}>点击画布上的展品以查看属性</div>
          )}
        </div>
      </div>
    </div>
  );
}
