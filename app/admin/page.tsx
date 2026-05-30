"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, ShieldAlert, ShoppingBag, Users, MessageSquare, Package, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading, login } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wholesale, setWholesale] = useState<any[]>([]);
  const [contact, setContact] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/orders?admin=true').then(r => r.json()),
      fetch('/api/bulk-inquiry').then(r => r.json()),
      fetch('/api/contact').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([ord, whl, con, pro]) => {
      setOrders(ord.orders || []);
      setWholesale(whl.inquiries || []);
      setContact(con.inquiries || []);
      setProducts(pro.products || []);
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-sm w-full p-8 md:p-12 rounded-[2.5rem] border border-black/10 bg-white/60 backdrop-blur-sm text-center shadow-xl"
        >
          <div className="w-14 h-14 rounded-full bg-red-100 border border-red-200 text-red-500 flex items-center justify-center mb-5 mx-auto">
            <ShieldAlert size={22} />
          </div>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-red-500 block mb-1">Access Restricted</span>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Admin Area Locked</h1>
          <p className="text-gray-500 text-xs font-light leading-relaxed mb-8">Sign in with your Google account to access the administrative dashboard.</p>
          <button
            onClick={login}
            className="w-full bg-[#111] text-[#EFEFE9] py-4 rounded-full font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.87 5.87 0 018 11.77a5.87 5.87 0 015.99-5.76c1.62 0 3.016.633 4.095 1.637l2.42-2.323C18.922 3.864 16.597 3 14 3 9.03 3 5 6.927 5 11.77c0 4.841 4.03 8.767 9 8.767 5.22 0 8.74-3.557 8.74-8.653 0-.585-.05-1.148-.15-1.6h-10.35z"/>
            </svg>
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const lowStock = products.filter(p => p.stock !== undefined && p.stock < 10).length;

  const metrics = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'bg-blue-50 text-blue-700 border-blue-200', href: '/admin/orders' },
    { label: 'Products', value: products.length, icon: Package, color: 'bg-violet-50 text-violet-700 border-violet-200', href: '/admin/products' },
    { label: 'Wholesale Leads', value: wholesale.length, icon: Users, color: 'bg-amber-50 text-amber-700 border-amber-200', href: '/admin/wholesale' },
    { label: 'Contact Messages', value: contact.length, icon: MessageSquare, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', href: '/admin/contact' },
    { label: 'Low Stock Items', value: lowStock, icon: TrendingUp, color: lowStock > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-2">Control Center</h1>
          <p className="text-gray-400 text-xs font-light uppercase tracking-widest">Welcome back, {user.email}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-black" />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {metrics.map((m, i) => {
                const Icon = m.icon;
                const card = (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`p-5 rounded-3xl border bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group ${m.href ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center mb-3 ${m.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">{m.label}</span>
                    <span className="text-3xl font-black text-black">{m.value}</span>
                  </motion.div>
                );
                return m.href ? <Link key={i} href={m.href}>{card}</Link> : <div key={i}>{card}</div>;
              })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white/60 rounded-3xl border border-black/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-black uppercase tracking-widest">Recent Orders</h2>
                <Link href="/admin/orders" className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View All →</Link>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No orders yet</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-black/5 last:border-none">
                      <div>
                        <span className="text-[10px] font-black font-mono text-black">{order.id}</span>
                        <span className="text-[9px] text-gray-400 block">{order.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-black">₹{order.total?.toFixed(2)}</span>
                        <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full block mt-0.5">Paid</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
