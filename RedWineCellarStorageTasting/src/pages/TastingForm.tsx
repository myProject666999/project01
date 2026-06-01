import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Save } from 'lucide-react';
import { useWineStore } from '@/stores/wineStore';
import { useTastingStore } from '@/stores/tastingStore';

interface FormData {
  wineId: number | '';
  inventoryId: number | '';
  tastingDate: string;
  companions: string;
  appearanceScore: number;
  aromaScore: number;
  tasteScore: number;
  overallScore: number;
  notes: string;
}

function ScoreSlider({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const pct = (value / max) * 100;
  const color =
    pct >= 80 ? 'from-green-500 to-green-400' :
    pct >= 60 ? 'from-gold to-yellow-400' :
    pct >= 40 ? 'from-amber-600 to-amber-500' :
    'from-red-600 to-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-400 font-body">{label}</span>
        <span className="font-display text-gold text-sm">
          {value} / {max}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none bg-cellar-dark rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-gold/30 [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="mt-1 h-1 bg-cellar-dark/50 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TastingForm() {
  const { wines, fetchWines } = useWineStore();
  const { createNote } = useTastingStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    wineId: '',
    inventoryId: '',
    tastingDate: new Date().toISOString().split('T')[0],
    companions: '',
    appearanceScore: 10,
    aromaScore: 15,
    tasteScore: 20,
    overallScore: 50,
    notes: '',
  });

  useEffect(() => {
    fetchWines();
  }, []);

  const selectedWine = wines.find((w) => w.id === Number(form.wineId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.wineId) return;

    setSaving(true);
    try {
      await createNote({
        wineId: Number(form.wineId),
        inventoryId: form.inventoryId ? Number(form.inventoryId) : undefined,
        tastingDate: form.tastingDate,
        companions: form.companions,
        appearanceScore: form.appearanceScore,
        aromaScore: form.aromaScore,
        tasteScore: form.tasteScore,
        overallScore: form.overallScore,
        notes: form.notes,
      });
      navigate('/tasting');
    } catch {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40 transition-colors';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">New Tasting Note</h1>
        <p className="text-gray-400 font-body mt-1">Record your tasting experience</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 font-body mb-1.5">Wine</label>
          <select
            value={form.wineId}
            onChange={(e) => setForm((f) => ({ ...f, wineId: Number(e.target.value) || '', inventoryId: '' }))}
            className={inputClass}
            required
          >
            <option value="">Select a wine...</option>
            {wines.map((w) => (
              <option key={w.id} value={w.id}>
                {w.chateau} {w.vintage}
              </option>
            ))}
          </select>
        </div>

        {selectedWine && selectedWine.bottleCount > 0 && (
          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">Bottle (optional)</label>
            <select
              value={form.inventoryId}
              onChange={(e) => setForm((f) => ({ ...f, inventoryId: Number(e.target.value) || '' }))}
              className={inputClass}
            >
              <option value="">Select a bottle...</option>
              {Array.from({ length: selectedWine.bottleCount }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Bottle #{i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">Tasting Date</label>
            <input
              type="date"
              value={form.tastingDate}
              onChange={(e) => setForm((f) => ({ ...f, tastingDate: e.target.value }))}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">Companions</label>
            <input
              type="text"
              value={form.companions}
              onChange={(e) => setForm((f) => ({ ...f, companions: e.target.value }))}
              className={inputClass}
              placeholder="Who tasted with you?"
            />
          </div>
        </div>

        <div className="space-y-5 pt-4 border-t border-gold/10">
          <h3 className="font-display text-lg text-gold">Scores</h3>

          <ScoreSlider
            label="Appearance"
            value={form.appearanceScore}
            max={20}
            onChange={(v) => setForm((f) => ({ ...f, appearanceScore: v }))}
          />
          <ScoreSlider
            label="Aroma"
            value={form.aromaScore}
            max={30}
            onChange={(v) => setForm((f) => ({ ...f, aromaScore: v }))}
          />
          <ScoreSlider
            label="Taste"
            value={form.tasteScore}
            max={40}
            onChange={(v) => setForm((f) => ({ ...f, tasteScore: v }))}
          />
          <ScoreSlider
            label="Overall"
            value={form.overallScore}
            max={100}
            onChange={(v) => setForm((f) => ({ ...f, overallScore: v }))}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 font-body mb-1.5">Tasting Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe the color, nose, palate, finish..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gold/10">
          <button
            type="submit"
            disabled={saving || !form.wineId}
            className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/80 text-gold px-6 py-2.5 rounded-lg font-body text-sm transition-colors shadow-lg shadow-burgundy/20 disabled:opacity-50"
          >
            <Clapperboard className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Tasting Note'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gold/10 text-gray-400 hover:text-gold hover:border-gold/30 font-body text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
