import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useWineStore, type GrapeVariety } from '@/stores/wineStore';

interface FormData {
  region: string;
  chateau: string;
  vintage: number | '';
  abv: number | '';
  drinkFrom: number | '';
  drinkTo: number | '';
  purchasePrice: number | '';
  marketPrice: number | '';
  grapeVarieties: GrapeVariety[];
}

export default function WineForm() {
  const { id } = useParams<{ id: string }>();
  const { current, createWine, updateWine, fetchWine } = useWineStore();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>({
    region: current?.region || '',
    chateau: current?.chateau || '',
    vintage: current?.vintage || '',
    abv: current?.abv || '',
    drinkFrom: current?.drinkFrom || '',
    drinkTo: current?.drinkTo || '',
    purchasePrice: current?.purchasePrice || '',
    marketPrice: current?.marketPrice || '',
    grapeVarieties: current?.grapeVarieties?.length
      ? current.grapeVarieties
      : [{ name: '', percentage: 100 }],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (id && !current) {
      fetchWine(Number(id));
    }
  });

  const addGrape = () => {
    setForm((f) => ({
      ...f,
      grapeVarieties: [...f.grapeVarieties, { name: '', percentage: 0 }],
    }));
  };

  const removeGrape = (index: number) => {
    setForm((f) => ({
      ...f,
      grapeVarieties: f.grapeVarieties.filter((_, i) => i !== index),
    }));
  };

  const updateGrape = (index: number, field: keyof GrapeVariety, value: string | number) => {
    setForm((f) => ({
      ...f,
      grapeVarieties: f.grapeVarieties.map((g, i) =>
        i === index ? { ...g, [field]: value } : g
      ),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.region.trim()) newErrors.region = 'Required';
    if (!form.chateau.trim()) newErrors.chateau = 'Required';
    if (!form.vintage) newErrors.vintage = 'Required';
    if (!form.abv) newErrors.abv = 'Required';
    if (!form.drinkFrom) newErrors.drinkFrom = 'Required';
    if (!form.drinkTo) newErrors.drinkTo = 'Required';
    if (!form.purchasePrice) newErrors.purchasePrice = 'Required';
    if (form.grapeVarieties.some((g) => !g.name.trim())) {
      newErrors.grapeVarieties = 'All grape names required';
    }
    if (form.grapeVarieties.some((g) => !g.percentage || g.percentage <= 0)) {
      newErrors.grapeVarieties = 'Grape percentage must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data = {
        region: form.region,
        chateau: form.chateau,
        vintage: Number(form.vintage),
        abv: Number(form.abv),
        drinkFrom: Number(form.drinkFrom),
        drinkTo: Number(form.drinkTo),
        purchasePrice: Number(form.purchasePrice),
        marketPrice: form.marketPrice ? Number(form.marketPrice) : null,
        grapeVarieties: form.grapeVarieties.map((g) => ({
          name: g.name,
          percentage: Number(g.percentage),
        })),
      };

      if (isEdit && id) {
        const wine = await updateWine(Number(id), data);
        navigate(`/wines/${wine.id}`);
      } else {
        const wine = await createWine(data);
        navigate(`/wines/${wine.id}`);
      }
    } catch {
      setSaving(false);
    }
  };

  const fieldClass = (field: keyof FormData) =>
    `w-full px-4 py-2.5 bg-cellar-dark/80 border rounded-lg text-gray-200 font-body text-sm focus:outline-none transition-colors ${
      errors[field] ? 'border-red-500' : 'border-gold/10 focus:border-gold/40'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">
          {isEdit ? '编辑酒款' : '新增酒款'}
        </h1>
        <p className="text-gray-400 font-body mt-1">
          {isEdit ? '更新酒款信息' : '添加酒款到您的酒窖'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-effect rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">产区</label>
            <input
              type="text"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              className={fieldClass('region')}
              placeholder="如：波尔多"
            />
            {errors.region && <p className="text-red-400 text-xs font-body mt-1">{errors.region}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">酒庄</label>
            <input
              type="text"
              value={form.chateau}
              onChange={(e) => setForm((f) => ({ ...f, chateau: e.target.value }))}
              className={fieldClass('chateau')}
              placeholder="如：玛歌庄园"
            />
            {errors.chateau && <p className="text-red-400 text-xs font-body mt-1">{errors.chateau}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">年份</label>
            <input
              type="number"
              value={form.vintage}
              onChange={(e) => setForm((f) => ({ ...f, vintage: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('vintage')}
              placeholder="如：2015"
            />
            {errors.vintage && <p className="text-red-400 text-xs font-body mt-1">{errors.vintage}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">酒精度 (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.abv}
              onChange={(e) => setForm((f) => ({ ...f, abv: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('abv')}
              placeholder="如：13.5"
            />
            {errors.abv && <p className="text-red-400 text-xs font-body mt-1">{errors.abv}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">适饮起始年</label>
            <input
              type="number"
              value={form.drinkFrom}
              onChange={(e) => setForm((f) => ({ ...f, drinkFrom: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('drinkFrom')}
              placeholder="如：2020"
            />
            {errors.drinkFrom && <p className="text-red-400 text-xs font-body mt-1">{errors.drinkFrom}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">适饮结束年</label>
            <input
              type="number"
              value={form.drinkTo}
              onChange={(e) => setForm((f) => ({ ...f, drinkTo: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('drinkTo')}
              placeholder="如：2035"
            />
            {errors.drinkTo && <p className="text-red-400 text-xs font-body mt-1">{errors.drinkTo}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">购入价 (¥)</label>
            <input
              type="number"
              step="0.01"
              value={form.purchasePrice}
              onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('purchasePrice')}
              placeholder="e.g. 120.00"
            />
            {errors.purchasePrice && <p className="text-red-400 text-xs font-body mt-1">{errors.purchasePrice}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 font-body mb-1.5">市价 (¥)</label>
            <input
              type="number"
              step="0.01"
              value={form.marketPrice}
              onChange={(e) => setForm((f) => ({ ...f, marketPrice: e.target.value ? Number(e.target.value) : '' }))}
              className={fieldClass('marketPrice')}
              placeholder="e.g. 180.00"
            />
            {errors.marketPrice && <p className="text-red-400 text-xs font-body mt-1">{errors.marketPrice}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-400 font-body">葡萄品种</label>
            <button
              type="button"
              onClick={addGrape}
              className="flex items-center gap-1 text-gold hover:text-gold/80 font-body text-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              添加品种
            </button>
          </div>
          {errors.grapeVarieties && (
            <p className="text-red-400 text-xs font-body mb-2">{errors.grapeVarieties}</p>
          )}
          <div className="space-y-2">
            {form.grapeVarieties.map((grape, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  value={grape.name}
                  onChange={(e) => updateGrape(i, 'name', e.target.value)}
                  placeholder="品种名"
                  className="flex-1 px-3 py-2 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40"
                />
                <div className="relative w-24">
                  <input
                    type="number"
                    value={grape.percentage}
                    onChange={(e) => updateGrape(i, 'percentage', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-cellar-dark/80 border border-gold/10 rounded-lg text-gray-200 font-body text-sm focus:outline-none focus:border-gold/40 pr-7"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                </div>
                {form.grapeVarieties.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGrape(i)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gold/10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-burgundy hover:bg-burgundy/80 text-gold px-6 py-2.5 rounded-lg font-body text-sm transition-colors shadow-lg shadow-burgundy/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : isEdit ? '更新酒款' : '添加酒款'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gold/10 text-gray-400 hover:text-gold hover:border-gold/30 font-body text-sm transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
