"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Inbox, ChevronDown, ChevronUp, Truck, Package, CheckCircle2,
  Clock, Box, MapPin, Calendar, X, FileText, Pencil
} from 'lucide-react';
import Link from 'next/link';

type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Packed', 'Shipped', 'Delivered'];

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  Pending:   { icon: Clock,         color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  Packed:    { icon: Box,           color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  Shipped:   { icon: Truck,         color: 'text-violet-700', bg: 'bg-violet-50',  border: 'border-violet-200' },
  Delivered: { icon: CheckCircle2,  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

// ─────────────────────────── Toast ───────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-20 md:bottom-8 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-black text-[#EFEFE9] shadow-2xl border border-white/10"
    >
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">✓</div>
      <span className="text-[11px] font-black uppercase tracking-wider">{message}</span>
    </motion.div>
  );
}

// ─────────────────────── Status Stepper ──────────────────────
function StatusStepper({ current }: { current: OrderStatus }) {
  const idx = STATUS_FLOW.indexOf(current);
  return (
    <div className="flex items-center w-full my-3">
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const Icon = cfg.icon;
        const done = i <= idx;
        const last = i === STATUS_FLOW.length - 1;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                done ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Icon size={13} />
              </div>
              <span className={`text-[7px] font-black uppercase tracking-wider ${done ? cfg.color : 'text-gray-400'}`}>{s}</span>
            </div>
            {!last && (
              <div className={`flex-1 h-[2px] mx-1 rounded-full ${i < idx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────── Edit Status Modal ───────────────────
function EditStatusModal({ order, onClose, onSave, saving }: {
  order: any; onClose: () => void;
  onSave: (update: { status: OrderStatus; trackingNumber?: string; carrier?: string; estimatedDelivery?: string }) => void;
  saving: boolean;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status || 'Pending');
  const [tracking, setTracking] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');
  const [estDelivery, setEstDelivery] = useState(order.estimatedDelivery || '');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">Update Delivery</span>
            <h2 className="text-base font-black uppercase tracking-tight">{order.id}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
        </div>

        {/* Status Picker */}
        <div className="mb-5">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-2">Order Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_FLOW.map(s => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              const active = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{s}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tracking Fields */}
        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Tracking Number</label>
            <input value={tracking} onChange={e => setTracking(e.target.value)}
              placeholder="e.g. DTDC123456789IN"
              className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Delivery Partner / Carrier</label>
            <input value={carrier} onChange={e => setCarrier(e.target.value)}
              placeholder="e.g. DTDC, BlueDart, Delhivery"
              className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Estimated Delivery Date</label>
            <input type="date" value={estDelivery} onChange={e => setEstDelivery(e.target.value)}
              className="w-full bg-[#EFEFE9] border border-black/10 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-black/10 text-xs font-black uppercase tracking-widest hover:bg-black/5 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => onSave({ status, trackingNumber: tracking, carrier, estimatedDelivery: estDelivery })}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-black text-[#EFEFE9] text-xs font-black uppercase tracking-widest hover:opacity-80 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Update
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────── Main Orders Page ────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?admin=true');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSave = async (update: any) => {
    if (!editOrder) return;
    setSaving(true);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editOrder.id, ...update }),
      });
      setOrders(prev => prev.map(o => o.id === editOrder.id ? { ...o, ...update } : o));
      setToast(`✓ Order ${editOrder.id} updated to "${update.status}"`);
      setEditOrder(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Orders</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-light">
            {filtered.length} orders • Total Revenue ₹{totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', ...STATUS_FLOW].map(s => {
            const active = filterStatus === s;
            const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5 ${
                  active ? 'bg-black text-[#EFEFE9] border-black' : 'bg-white border-black/10 text-gray-500 hover:border-black/30'
                }`}
              >
                {s}
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono ${active ? 'bg-white/15' : 'bg-black/5'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-black/10 rounded-3xl bg-white/40">
            <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">No orders in this status</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.Pending;
              const Icon = cfg.icon;
              const expanded = expandedId === order.id;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/60 border border-black/5 rounded-3xl overflow-hidden hover:border-black/10 transition-colors"
                >
                  {/* Order Summary Row */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : order.id)}
                    className="flex items-center gap-4 p-5 cursor-pointer select-none"
                  >
                    {/* Status Icon */}
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                      <Icon size={15} />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm uppercase truncate">{order.id}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 block">{order.email} • {order.date}</span>
                    </div>

                    {/* Total + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black">₹{order.total?.toFixed(2)}</span>
                      <button
                        onClick={e => { e.stopPropagation(); setEditOrder(order); }}
                        className="p-2 rounded-xl border border-black/10 hover:bg-black hover:text-[#EFEFE9] hover:border-black transition-all cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <div className="text-gray-400">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="border-t border-black/5 overflow-hidden"
                      >
                        <div className="p-5 flex flex-col gap-5">
                          {/* Status Stepper */}
                          <StatusStepper current={order.status || 'Pending'} />

                          {/* Tracking Info */}
                          {(order.trackingNumber || order.carrier || order.estimatedDelivery) && (
                            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
                              <div className="flex items-center gap-2 flex-1">
                                <Truck size={14} className="text-violet-600 shrink-0" />
                                <div>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block">Tracking</span>
                                  <span className="text-xs font-black font-mono">{order.trackingNumber || '—'}</span>
                                </div>
                              </div>
                              {order.carrier && (
                                <div className="flex items-center gap-2 flex-1">
                                  <Package size={14} className="text-violet-600 shrink-0" />
                                  <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block">Carrier</span>
                                    <span className="text-xs font-black">{order.carrier}</span>
                                  </div>
                                </div>
                              )}
                              {order.estimatedDelivery && (
                                <div className="flex items-center gap-2 flex-1">
                                  <Calendar size={14} className="text-violet-600 shrink-0" />
                                  <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block">Est. Delivery</span>
                                    <span className="text-xs font-black">{order.estimatedDelivery}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Items */}
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-3">Items Ordered</span>
                            <div className="flex flex-col gap-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 bg-white/60 px-3 py-2 rounded-xl border border-black/5">
                                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color || '#EFEFE9' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.name} className="w-7 h-7 object-contain" />
                                  </div>
                                  <span className="text-xs font-black uppercase flex-1 truncate">{item.name}</span>
                                  <span className="text-[9px] text-gray-500 font-bold">×{item.quantity}</span>
                                  <span className="text-xs font-black">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Invoice Link */}
                          <div className="flex justify-end">
                            <Link
                              href={`/profile/invoice/${order.id}`}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-[#EFEFE9] hover:border-black transition-all"
                            >
                              <FileText size={12} /> View Invoice
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editOrder && (
          <EditStatusModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleSave} saving={saving} />
        )}
        {toast && <Toast key={toast} message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
