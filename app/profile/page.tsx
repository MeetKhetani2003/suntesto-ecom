"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { Mail, MapPin, Phone, ChevronDown, ChevronUp, Package, Calendar, Clock, Lock, LogOut, Loader2, Truck, Box, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
}

type OrderStatus = 'Pending' | 'Packed' | 'Shipped' | 'Delivered';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Packed', 'Shipped', 'Delivered'];

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  Pending:   { icon: Clock,        color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',  label: 'Order Pending' },
  Packed:    { icon: Box,          color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',   label: 'Being Packed' },
  Shipped:   { icon: Truck,        color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200', label: 'Shipped Out' },
  Delivered: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Delivered!' },
};

function StatusTracker({ status }: { status: OrderStatus }) {
  const idx = STATUS_FLOW.indexOf(status);
  return (
    <div className="flex items-center w-full">
      {STATUS_FLOW.map((s, i) => {
        const cfg = STATUS_CONFIG[s];
        const Icon = cfg.icon;
        const done = i <= idx;
        const last = i === STATUS_FLOW.length - 1;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}>
                <Icon size={13} />
              </div>
              <span className={`text-[7px] font-black uppercase tracking-wider leading-none ${
                done ? cfg.color : 'text-gray-400'
              }`}>{s}</span>
            </div>
            {!last && (
              <div className={`flex-1 h-[3px] mx-1 rounded-full transition-all ${
                i < idx ? 'bg-emerald-400' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string | null;
  carrier?: string | null;
  estimatedDelivery?: string | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading, login, logout, refresh } = useAuth();

  // Edit Profile Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Order History State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Sync edits when user is loaded
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
    }
  }, [user]);

  // Load orders
  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orders) {
            setOrders(data.orders);
          }
        })
        .catch(err => console.error('Error fetching orders:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: editPhone,
          address: editAddress
        })
      });

      if (res.ok) {
        await refresh();
        setIsEditing(false);
      } else {
        alert('Failed to update shipping and phone details.');
      }
    } catch (e) {
      console.error('Profile save error:', e);
      alert('Network error. Failed to save details.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // 1. Session is verifying
  if (authLoading) {
    return (
      <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Syncing Profile Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Lock Layout
  if (!user) {
    return (
      <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 flex items-center justify-center pb-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-w-md w-full p-8 md:p-12 rounded-[2.5rem] border border-black/10 bg-white/40 backdrop-blur-sm text-center shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100/50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 mx-auto shadow-sm">
              <Lock size={24} />
            </div>
            
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 block mb-1">Access Restrained</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Authentication Needed</h3>
            <p className="text-gray-500 text-xs font-light leading-relaxed mb-8 max-w-xs mx-auto">
              Please authenticate securely using your Google account to access your organic profile settings, shipping details, and live order tracking.
            </p>
            
            <button
              onClick={login}
              className="w-full bg-[#111] text-[#EFEFE9] py-4 rounded-full font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.87 5.87 0 018 11.77a5.87 5.87 0 015.99-5.76c1.62 0 3.016.633 4.095 1.637l2.42-2.323C18.922 3.864 16.597 3 14 3 9.03 3 5 6.927 5 11.77c0 4.841 4.03 8.767 9 8.767 5.22 0 8.74-3.557 8.74-8.653 0-.585-.05-1.148-.15-1.6h-10.35z"/>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Authenticated Profile Page View
  return (
    <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 pb-40">
        
        {/* Header Title */}
        <div className="mb-16 md:mb-24">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[8vw] font-black tracking-tighter mb-6 leading-[0.9] uppercase"
          >
            My<br />Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-gray-600 max-w-lg text-lg font-light"
          >
            Manage your personal settings, track orders, and view your freeze-dried organic treats collection.
          </motion.p>
        </div>

        {/* Master Flex Grid */}
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* USER DATA BLOCK (Left) */}
          <aside className="w-full lg:w-[400px] shrink-0 sticky top-36 h-fit bg-white/40 backdrop-blur-sm border border-black/10 rounded-3xl p-8 shadow-sm">
            
            {/* User Profile Avatar Card */}
            <div className="flex items-center gap-6 mb-8 border-b border-black/5 pb-8">
              <div className="w-20 h-20 rounded-full bg-[#111] text-[#EFEFE9] flex items-center justify-center font-black text-2xl shadow-md overflow-hidden shrink-0">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div>
                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[9px] tracking-[0.2em] font-black uppercase px-3 py-1 rounded-full block w-max mb-1.5 shadow-sm">
                  {user.tier || 'Gold Tier Member'}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{user.name}</h3>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">Joined since {user.joined || 'January 2025'}</span>
              </div>
            </div>

            {/* Profile fields or Edit Form */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                /* Profile Display */
                <motion.div
                  key="profile-display"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex gap-4 items-start">
                    <Mail size={16} className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black tracking-wider uppercase text-gray-400 block mb-0.5">Email Address</span>
                      <span className="text-sm font-semibold truncate block max-w-[280px]">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Phone size={16} className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black tracking-wider uppercase text-gray-400 block mb-0.5">Contact Number</span>
                      <span className="text-sm font-semibold">
                        {user.phone ? user.phone : <span className="text-gray-400 font-normal italic">No contact phone added</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <span className="text-[9px] font-black tracking-wider uppercase text-gray-400 block mb-0.5">Default Shipping Address</span>
                      <span className="text-sm font-semibold leading-relaxed">
                        {user.address ? user.address : <span className="text-gray-400 font-normal italic">No default address provided</span>}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-[#111] text-[#EFEFE9] py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase mt-6 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-md cursor-pointer"
                  >
                    Edit Profile Details
                  </button>

                  <button
                    onClick={logout}
                    className="w-full bg-transparent border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white py-3.5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} />
                    Log Out Session
                  </button>
                </motion.div>
              ) : (
                /* Profile Edit Mode Form */
                <motion.form
                  key="profile-edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleProfileSave}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-wider uppercase text-gray-400">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={editName}
                      className="w-full bg-black/5 border border-black/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-wider uppercase text-gray-400">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 382-9901"
                      className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-wider uppercase text-gray-400">Shipping Address</label>
                    <textarea
                      required
                      rows={3}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="e.g. 128 Nature Way, CA 90210"
                      className="w-full bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => {
                        setEditPhone(user.phone || '');
                        setEditAddress(user.address || '');
                        setIsEditing(false);
                      }}
                      className="flex-1 border border-black px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-black/5 disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 bg-black text-[#EFEFE9] px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </aside>

          {/* ORDER HISTORY LIST (Right) */}
          <div className="flex-1 w-full">
            <div className="mb-8 flex items-center gap-3">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Order History</span>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>

            {/* Orders list container */}
            <div className="flex flex-col gap-6">
              {ordersLoading ? (
                /* Premium Skeleton Loaders */
                <div className="flex flex-col gap-6">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div key={idx} className="border border-black/5 rounded-3xl p-8 bg-white/20 animate-pulse flex flex-col gap-4">
                      <div className="h-6 bg-black/10 rounded w-1/3" />
                      <div className="h-4 bg-black/5 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                /* Empty state */
                <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-black/10 rounded-[2rem] bg-white/20">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">No orders found</span>
                  <p className="text-gray-500 text-[10px] max-w-xs font-light">You have not placed any orders yet. Navigate to our catalog to select freeze-dried treats!</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  
                  return (
                    <div 
                      key={order.id}
                      className="border border-black/10 rounded-3xl overflow-hidden bg-white/40 backdrop-blur-sm hover:border-black/20 transition-colors"
                    >
                      {/* Order Row Header */}
                      <div 
                        onClick={() => toggleExpandOrder(order.id)}
                        className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer select-none"
                      >
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="font-black text-lg uppercase">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                            <Calendar size={12} />
                            <span>{order.date}</span>
                          </div>
                          {(() => {
                            const s = (order.status || 'Pending') as OrderStatus;
                            const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.Pending;
                            return (
                              <span className={`text-[9px] tracking-[0.2em] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t border-black/5 md:border-none pt-4 md:pt-0">
                          <div className="text-right">
                            <span className="text-[9px] font-black tracking-widest uppercase text-gray-400 block mb-0.5">Order Total</span>
                            <span className="text-lg font-black">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="w-10 h-10 border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-[#EFEFE9] transition-all">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Order Detail Dropdown (Framer Motion) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="border-t border-black/10 bg-black/[0.01]"
                          >
                            <div className="p-6 md:p-8 flex flex-col gap-6">

                              {/* 4-step status progress tracker */}
                              <div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-3">Delivery Status</span>
                                <StatusTracker status={(order.status || 'Pending') as OrderStatus} />
                              </div>

                              {/* Tracking info */}
                              {(order.trackingNumber || order.carrier || order.estimatedDelivery) && (
                                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {order.trackingNumber && (
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block mb-0.5">Tracking #</span>
                                      <span className="text-xs font-black font-mono">{order.trackingNumber}</span>
                                    </div>
                                  )}
                                  {order.carrier && (
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block mb-0.5">Carrier</span>
                                      <span className="text-xs font-black">{order.carrier}</span>
                                    </div>
                                  )}
                                  {order.estimatedDelivery && (
                                    <div>
                                      <span className="text-[8px] font-black uppercase tracking-widest text-violet-500 block mb-0.5">Est. Delivery</span>
                                      <span className="text-xs font-black">{order.estimatedDelivery}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">Purchased Items</h4>
                              
                              {/* Items List */}
                              <div className="flex flex-col gap-4">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex gap-4 md:gap-6 items-center justify-between">
                                    <div className="flex gap-4 items-center">
                                      <div 
                                        className="w-16 h-16 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-black/5"
                                        style={{ backgroundColor: item.color }}
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                                      </div>
                                      <div>
                                        <h5 className="font-black text-sm uppercase">{item.name}</h5>
                                        <span className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity} • ${item.price.toFixed(2)} each</span>
                                      </div>
                                    </div>
                                    <span className="font-bold text-sm text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Summary & Invoice Block */}
                              <div className="border-t border-black/5 pt-6 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">
                                  Payment Method: Verified Razorpay
                                </span>
                                <div className="flex gap-3 w-full sm:w-auto">
                                  <Link 
                                    href={`/profile/invoice/${order.id}`}
                                    className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-black text-[#EFEFE9] rounded-full text-[10px] font-black tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                                  >
                                    View Invoice
                                  </Link>
                                  <Link 
                                    href={`/products`}
                                    className="flex-1 sm:flex-none text-center px-5 py-2.5 border border-black text-black rounded-full text-[10px] font-black tracking-widest uppercase hover:bg-black hover:text-[#EFEFE9] transition-colors"
                                  >
                                    Buy It Again
                                  </Link>
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
