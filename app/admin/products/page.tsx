"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SortAsc, SortDesc, Trash2, Pencil, Loader2, X, AlertTriangle,
  Package, ChevronDown, Check, ImageOff
} from 'lucide-react';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  image?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
};

type SortKey = 'name' | 'price' | 'stock' | 'category';
type SortDir = 'asc' | 'desc';

const CATEGORIES = ['All', 'Regular frozen', 'chocolate coated fruits', 'Fruit Powder', 'Bulk order Listing', 'Combo of Products'];

// ============================================================
// Toast
// ============================================================
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-20 md:bottom-8 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-black text-[#EFEFE9] shadow-2xl border border-white/10 backdrop-blur-md"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">✓</div>
      <span className="text-[11px] font-black uppercase tracking-wider">{message}</span>
    </motion.div>
  );
}

// ============================================================
// Delete Confirmation Modal
// ============================================================
function DeleteModal({ product, onConfirm, onCancel, loading }: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-black/5"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mb-5 mx-auto">
          <AlertTriangle size={20} />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tighter text-center mb-2">Are you sure?</h2>
        <p className="text-xs text-gray-500 text-center mb-1 font-light leading-relaxed">
          You are about to permanently delete:
        </p>
        <p className="text-sm font-black text-center text-black mb-6 uppercase tracking-tight">"{product.name}"</p>
        <p className="text-[9px] text-red-500 font-black uppercase tracking-widest text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-black/10 text-xs font-black uppercase tracking-widest hover:bg-black/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>Delete</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Edit Confirmation Modal
// ============================================================
function EditConfirmModal({ changes, onConfirm, onCancel, loading }: {
  changes: { field: string; from: any; to: any }[];
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-black/5 max-h-[80vh] overflow-y-auto"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mb-5 mx-auto">
          <Pencil size={18} />
        </div>
        <h2 className="text-lg font-black uppercase tracking-tighter text-center mb-2">Confirm Update?</h2>
        <p className="text-xs text-gray-500 text-center mb-6 font-light">Review the following field changes before saving.</p>

        <div className="flex flex-col gap-3 mb-6">
          {changes.map(({ field, from, to }) => (
            <div key={field} className="bg-gray-50 rounded-2xl p-4 border border-black/5">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">{field}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-red-500 line-through flex-1 truncate">{String(from)}</span>
                <span className="text-gray-400">→</span>
                <span className="text-xs font-black text-emerald-700 flex-1 truncate">{String(to)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-black/10 text-xs font-black uppercase tracking-widest hover:bg-black/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-black text-[#EFEFE9] text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Confirm Update</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Edit Drawer
// ============================================================
function EditDrawer({ product, onClose, onSave }: {
  product: Product;
  onClose: () => void;
  onSave: (updated: Partial<Product> & { id: string }) => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    originalPrice: String(product.originalPrice || ''),
    stock: String(product.stock),
    category: product.category,
  });
  const [pendingChanges, setPendingChanges] = useState<{ field: string; from: any; to: any }[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compute changed fields
    const fieldLabels: Record<string, string> = {
      name: 'Product Name',
      price: 'Price',
      originalPrice: 'Original Price',
      stock: 'Stock Quantity',
      category: 'Category',
    };
    const changed: { field: string; from: any; to: any }[] = [];
    if (form.name !== product.name) changed.push({ field: fieldLabels.name, from: product.name, to: form.name });
    if (Number(form.price) !== product.price) changed.push({ field: fieldLabels.price, from: product.price, to: Number(form.price) });
    if (form.originalPrice && Number(form.originalPrice) !== product.originalPrice) changed.push({ field: fieldLabels.originalPrice, from: product.originalPrice, to: Number(form.originalPrice) });
    if (Number(form.stock) !== product.stock) changed.push({ field: fieldLabels.stock, from: product.stock, to: Number(form.stock) });
    if (form.category !== product.category) changed.push({ field: fieldLabels.category, from: product.category, to: form.category });

    if (changed.length === 0) {
      onClose();
      return;
    }
    setPendingChanges(changed);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await onSave({
        id: product.id,
        name: form.name,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        category: form.category,
      });
      setConfirmOpen(false);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm z-[95] bg-white shadow-2xl overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">Editing Product</span>
            <h2 className="text-base font-black uppercase tracking-tight">{product.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 flex flex-col gap-5">
          {[
            { label: 'Product Name', key: 'name', type: 'text', placeholder: 'e.g. Raspberry' },
            { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '0.00', step: '0.01' },
            { label: 'Original Price (₹)', key: 'originalPrice', type: 'number', placeholder: '0.00', step: '0.01' },
            { label: 'Stock Quantity', key: 'stock', type: 'number', placeholder: '0' },
          ].map(({ label, key, type, placeholder, step }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</label>
              <input
                type={type}
                step={step}
                value={(form as any)[key]}
                onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                required={key === 'name' || key === 'price' || key === 'stock'}
                className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors h-12"
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mt-auto pt-6 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-black/10 text-xs font-black uppercase tracking-widest hover:bg-black/5 transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3.5 rounded-2xl bg-black text-[#EFEFE9] text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all cursor-pointer">
              Review Changes
            </button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {confirmOpen && (
          <EditConfirmModal
            changes={pendingChanges}
            onConfirm={handleConfirmSave}
            onCancel={() => setConfirmOpen(false)}
            loading={saving}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Main Products Page
// ============================================================
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error('Error loading products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/products?id=${deleteProduct.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      triggerToast(`✓ "${deleteProduct.name}" deleted successfully`);
    } finally {
      setDeleteLoading(false);
      setDeleteProduct(null);
    }
  };

  const handleSave = async (updated: Partial<Product> & { id: string }) => {
    await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    triggerToast(`✓ "${updated.name}" updated successfully`);
  };

  // Filter + Sort
  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      let va: any = a[sortKey], vb: any = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = sortDir === 'asc' ? SortAsc : SortDesc;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Products</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-light">
              {filtered.length} of {products.length} items
            </p>
          </div>
          <Link
            href="/admin/create-product"
            className="px-6 py-3 bg-black text-[#EFEFE9] rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition-all shrink-0"
          >
            + Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-2xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white border border-black/10 rounded-2xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-black/30 transition-colors cursor-pointer h-full min-w-[160px]"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Sort Row */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-4 mb-2">
          {(['name', 'price', 'stock', 'category'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className="text-left text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
            >
              {key}
              {sortKey === key && <SortIcon size={10} />}
            </button>
          ))}
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Actions</span>
        </div>

        {/* Product List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-black/10 rounded-3xl bg-white/40">
            <Package size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/60 border border-black/5 rounded-2xl px-4 py-4 hover:border-black/15 hover:shadow-sm transition-all"
              >
                {/* Mobile layout */}
                <div className="flex md:hidden items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-black/5"
                    style={{ backgroundColor: product.color || '#EFEFE9' }}
                  >
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <ImageOff size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black text-sm uppercase tracking-tight block truncate">{product.name}</span>
                    <span className="text-[9px] text-gray-500 uppercase font-semibold tracking-wider">{product.category}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-black">₹{product.price}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${product.stock < 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="p-2 rounded-xl border border-black/10 hover:bg-black hover:text-[#EFEFE9] hover:border-black transition-all cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 items-center">
                  {/* Name + Image */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-black/5"
                      style={{ backgroundColor: product.color || '#EFEFE9' }}
                    >
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="w-9 h-9 object-contain" />
                      ) : (
                        <ImageOff size={14} className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-sm uppercase tracking-tight block truncate">{product.name}</span>
                      <span className="text-[9px] font-mono text-gray-400">{product.id}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-black">₹{product.price}</span>

                  {/* Stock */}
                  <span className={`text-xs font-black px-3 py-1 rounded-full border w-fit ${
                    product.stock < 5 ? 'bg-red-50 text-red-600 border-red-200' :
                    product.stock < 20 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {product.stock}
                  </span>

                  {/* Category */}
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 truncate">{product.category}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditProduct(product)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-[#EFEFE9] hover:border-black transition-all cursor-pointer"
                    >
                      <Pencil size={12} />
                      Update
                    </button>
                    <button
                      onClick={() => setDeleteProduct(product)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {deleteProduct && (
          <DeleteModal
            product={deleteProduct}
            onConfirm={handleDelete}
            onCancel={() => setDeleteProduct(null)}
            loading={deleteLoading}
          />
        )}
        {editProduct && (
          <EditDrawer
            product={editProduct}
            onClose={() => setEditProduct(null)}
            onSave={handleSave}
          />
        )}
        {toast && <Toast key={toast} message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
