"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2 } from 'lucide-react';

const packagingOptions = [
  { label: 'Sustento Assorted Blend (Main Hero)', value: '/api/images/main_hero.png' },
  { label: 'Mango Packaging', value: '/api/images/mango_hero.png' },
  { label: 'Banana Packaging', value: '/api/images/banana_hero.png' },
  { label: 'Pineapple Packaging', value: '/api/images/pineapple-hero.png' },
  { label: 'Strawberry Packaging', value: '/api/images/strawberry_hero.png' },
  { label: 'Lemon Packaging', value: '/api/images/lemon-hero.png' },
  { label: 'Chocolate Coated Strawberries', value: '/api/images/chocolate-hero.png' },
];

const colorThemes = [
  { name: 'Rose Red (Strawberry)', color: '#FECDD3', darkColor: '#BE123C' },
  { name: 'Amber Yellow (Mango)', color: '#FDE68A', darkColor: '#D97706' },
  { name: 'Lemon Green (Lime)', color: '#D9F99D', darkColor: '#4D7C0F' },
  { name: 'Gold Yellow (Banana)', color: '#FEF08A', darkColor: '#CA8A04' },
  { name: 'Pineapple Gold (Tropical)', color: '#FEF9C3', darkColor: '#A16207' },
  { name: 'Belgium Choco (Chocolate)', color: '#FEE2E2', darkColor: '#451A03' },
  { name: 'Dynamic Cyan (Variety)', color: '#E0F2FE', darkColor: '#0369A1' },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-20 md:bottom-8 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-black text-[#EFEFE9] shadow-2xl border border-white/10"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">✓</div>
      <span className="text-[11px] font-black uppercase tracking-wider">{message}</span>
    </motion.div>
  );
}

export default function AdminCreateProductPage() {
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Regular frozen');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodStock, setProdStock] = useState('100');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCalories, setProdCalories] = useState('80 kcal');
  const [prodSugar, setProdSugar] = useState('12g');
  const [prodShelfLife, setProdShelfLife] = useState('18 Months');
  const [prodIngredients, setProdIngredients] = useState('');
  const [prodOrigin, setProdOrigin] = useState('Organic Farm');
  const [prodColor, setProdColor] = useState('#FECDD3');
  const [prodDarkColor, setProdDarkColor] = useState('#BE123C');
  const [prodImage, setProdImage] = useState('/api/images/main_hero.png');
  const [uploadMode, setUploadMode] = useState<'preset' | 'upload'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice.trim()) {
      alert('Please enter a product name and price.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName, category: prodCategory, price: Number(prodPrice),
          originalPrice: Number(prodOriginalPrice) || Number(prodPrice) * 1.2,
          stock: Number(prodStock), desc: prodDesc, calories: prodCalories, sugar: prodSugar,
          shelfLife: prodShelfLife, ingredients: prodIngredients || `100% Organic Freeze-Dried ${prodName}`,
          origin: prodOrigin, color: prodColor, darkColor: prodDarkColor, image: prodImage,
        }),
      });
      if (res.ok) {
        setToast(`✓ Product "${prodName}" injected successfully!`);
        setProdName(''); setProdPrice(''); setProdOriginalPrice(''); setProdDesc(''); setProdIngredients('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to inject product.');
      }
    } catch (err) {
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-7">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Add Product</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-light">Inject a new catalog item into MongoDB</p>
        </div>

        <div className="max-w-3xl bg-white/60 border border-black/5 rounded-3xl p-6 md:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* Basic */}
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block mb-4">1. Basic Specifications</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'Product Name', value: prodName, onChange: setProdName, placeholder: 'e.g. Raspberry', type: 'text', required: true },
                  { label: 'Price (₹)', value: prodPrice, onChange: setProdPrice, placeholder: '0.00', type: 'number', step: '0.01', required: true },
                  { label: 'Stock Level', value: prodStock, onChange: setProdStock, placeholder: '100', type: 'number', required: true },
                ].map(({ label, value, onChange, placeholder, type, step, required }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">{label}</label>
                    <input type={type} step={step} required={required} value={value}
                      onChange={e => onChange(e.target.value)} placeholder={placeholder}
                      className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Category + Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Category</label>
                <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold h-12">
                  <option value="Regular frozen">Regular Frozen Fruit</option>
                  <option value="chocolate coated fruits">Chocolate Coated Fruit</option>
                  <option value="Fruit Powder">Organic Fruit Powder</option>
                  <option value="Bulk order Listing">Bulk Value Packs</option>
                  <option value="Combo of Products">Variety Combos</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Packaging Image</label>
                  <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
                    {(['preset', 'upload'] as const).map(m => (
                      <button key={m} type="button" onClick={() => setUploadMode(m)}
                        className={`px-3 py-1 rounded-md text-[8px] font-black uppercase cursor-pointer transition-all ${uploadMode === m ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>
                        {m === 'preset' ? 'Presets' : 'Upload'}
                      </button>
                    ))}
                  </div>
                </div>
                {uploadMode === 'preset' ? (
                  <select value={prodImage} onChange={e => setProdImage(e.target.value)}
                    className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold h-12">
                    {packagingOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <div>
                    <input type="file" accept="image/*" id="mockup-upload" className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        setIsUploading(true);
                        const fd = new FormData(); fd.append('file', file);
                        try {
                          const r = await fetch('/api/images/upload', { method: 'POST', body: fd });
                          const d = await r.json();
                          if (d.success && d.imageUrl) { setProdImage(d.imageUrl); setToast('✓ Mockup uploaded!'); }
                          else alert(d.error || 'Upload failed');
                        } finally { setIsUploading(false); }
                      }}
                    />
                    <label htmlFor="mockup-upload"
                      className="flex items-center justify-center gap-2 border border-dashed border-black/20 hover:border-black/50 h-12 rounded-xl text-xs font-black tracking-widest text-gray-500 cursor-pointer bg-[#EFEFE9] transition-colors">
                      {isUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : 'Choose Image...'}
                    </label>
                  </div>
                )}
                {prodImage && (
                  <div className="flex items-center gap-2 bg-white/60 p-2 rounded-xl border border-black/5 mt-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prodImage} alt="preview" className="w-9 h-9 object-contain rounded-lg border border-black/5" />
                    <span className="text-[9px] font-mono text-gray-500 truncate">{prodImage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block mb-3">2. Color Aesthetics</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                {[
                  { label: 'Background Light Hex', value: prodColor, onChange: setProdColor },
                  { label: 'Accent Dark Hex', value: prodDarkColor, onChange: setProdDarkColor },
                ].map(({ label, value, onChange }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">{label}</label>
                    <div className="flex gap-2">
                      <input type="text" value={value} onChange={e => onChange(e.target.value)}
                        className="bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold w-2/3" />
                      <input type="color" value={value} onChange={e => onChange(e.target.value)}
                        className="w-1/3 h-11 border border-black/10 rounded-xl p-1 cursor-pointer bg-white" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorThemes.map((t, i) => (
                  <button key={i} type="button" onClick={() => { setProdColor(t.color); setProdDarkColor(t.darkColor); }}
                    className="px-3 py-1.5 border border-black/5 hover:border-black/20 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full border border-black/5 inline-block" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description + Specs */}
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block mb-4">3. Description & Specs</span>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Product Description</label>
                  <textarea rows={2} required value={prodDesc} onChange={e => setProdDesc(e.target.value)}
                    placeholder="e.g. Crisp, sweet freeze-dried red raspberries..."
                    className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold resize-none focus:outline-none focus:border-black/30" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Calories', value: prodCalories, onChange: setProdCalories },
                    { label: 'Sugar', value: prodSugar, onChange: setProdSugar },
                    { label: 'Shelf Life', value: prodShelfLife, onChange: setProdShelfLife },
                    { label: 'Origin', value: prodOrigin, onChange: setProdOrigin },
                  ].map(({ label, value, onChange }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">{label}</label>
                      <input type="text" value={value} onChange={e => onChange(e.target.value)}
                        className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Ingredients</label>
                  <input type="text" value={prodIngredients} onChange={e => setProdIngredients(e.target.value)}
                    placeholder="e.g. 100% Organic Freeze-Dried Raspberry"
                    className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-black/10 pt-6">
              <button type="submit" disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-4 bg-[#111] text-[#EFEFE9] rounded-full text-xs font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer">
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Injecting...</> : <><PlusCircle size={14} /> Inject to Catalog</>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
