"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Printer, ShieldCheck, Download, Calendar, Receipt, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'In Transit' | 'Processing';
  items: OrderItem[];
}

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  // Load order details dynamically
  useEffect(() => {
    if (user) {
      setLoadingOrder(true);
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orders) {
            const found = data.orders.find((o: any) => o.id === id);
            if (found) {
              setOrder(found);
            }
          }
        })
        .catch(err => console.error('Error fetching order invoice:', err))
        .finally(() => setLoadingOrder(false));
    }
  }, [user, id]);

  const handlePrint = () => {
    window.print();
  };

  // 1. Session Loading
  if (authLoading || loadingOrder) {
    return (
      <div className="min-h-screen bg-[#EFEFE9] text-[#111] flex items-center justify-center pt-24 print:hidden">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Loading Order Invoice...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Lock
  if (!user) {
    return notFound();
  }

  // 3. Order Not Found
  if (!order) {
    return (
      <div className="min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col items-center justify-center pt-24 px-6 print:hidden">
        <div className="max-w-md text-center p-8 rounded-[2rem] border border-black/10 bg-white/40">
          <h3 className="text-xl font-black uppercase mb-4">Invoice Not Found</h3>
          <p className="text-xs text-gray-500 mb-6">We could not locate an invoice matching order ID <strong>{id}</strong>.</p>
          <Link href="/profile" className="px-6 py-3 bg-black text-white rounded-full text-xs font-black tracking-widest uppercase">
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Pricing calculations
  const cartTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 40;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 4.99;
  const estimatedTax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingCost + estimatedTax;

  return (
    <div className="min-h-screen bg-[#EFEFE9] text-[#111] pt-32 pb-40 px-6 sm:px-12 md:px-24 print:bg-white print:text-black print:pt-0 print:pb-0 print:px-0">
      
      {/* Header controls (hidden on print) */}
      <div className="max-w-[900px] mx-auto mb-10 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <Link href="/profile" className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="px-6 py-3 border border-black rounded-full text-xs font-black tracking-widest uppercase hover:bg-black hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer size={13} /> Print Invoice
          </button>
        </div>
      </div>

      {/* INVOICE CONTAINER (A4 structured card) */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[900px] mx-auto bg-white border border-black/10 rounded-[2.5rem] p-8 sm:p-16 shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:p-0 print:rounded-none print:bg-white"
      >
        
        {/* Top brand header details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-black/10 pb-12 mb-12 gap-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1.5">Sustento</h2>
            <span className="text-[10px] tracking-[0.35em] uppercase text-gray-400 font-bold block">Organic Freeze-Dried</span>
          </div>

          <div className="text-left sm:text-right">
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] tracking-[0.25em] font-black uppercase px-4 py-1.5 rounded-full inline-flex items-center gap-2 mb-3 shadow-sm print:border print:text-emerald-800">
              <CheckCircle2 size={12} className="text-emerald-600" /> Paid via Razorpay
            </span>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mt-1">Invoice Receipt</div>
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-black/10 pb-12 mb-12 text-xs uppercase tracking-wider font-semibold">
          <div>
            <div className="text-gray-400 font-bold mb-2">Invoice Info</div>
            <div className="text-black font-black text-sm mb-1 font-mono">{order.id}</div>
            <div className="text-gray-500 font-bold">{order.date}</div>
          </div>

          <div>
            <div className="text-gray-400 font-bold mb-2">Billed To</div>
            <div className="text-black font-black mb-1">{user.name}</div>
            <div className="text-gray-500 font-bold truncate max-w-[200px]">{user.email}</div>
          </div>

          <div>
            <div className="text-gray-400 font-bold mb-2">Shipped Address</div>
            <div className="text-black font-black mb-1">{user.name}</div>
            <div className="text-gray-500 font-bold leading-relaxed max-w-[240px]">
              {user.address || 'No shipping address specified'}
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-12">
          <h3 className="text-xs font-black tracking-[0.2em] uppercase text-gray-400 mb-6">Purchased Items Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs uppercase tracking-wider font-semibold">
              <thead>
                <tr className="border-b border-black/10 pb-3 text-gray-400">
                  <th className="pb-4 w-1/2">Product Description</th>
                  <th className="pb-4 text-center">Qty</th>
                  <th className="pb-4 text-right">Unit Price</th>
                  <th className="pb-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-black/5 text-[#111]">
                    <td className="py-5 font-black flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl p-1 flex items-center justify-center shrink-0 border border-black/5 print:hidden"
                        style={{ backgroundColor: item.color }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                      </div>
                      <span>{item.name}</span>
                    </td>
                    <td className="py-5 text-center font-bold text-gray-500">{item.quantity}</td>
                    <td className="py-5 text-right font-bold text-gray-500">${item.price.toFixed(2)}</td>
                    <td className="py-5 text-right font-black text-[#111]">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary Blocks */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-t border-black/10 pt-12">
          <div className="bg-[#F7F7F5] rounded-3xl p-6 border border-black/5 max-w-sm flex gap-4 items-start print:border print:bg-white print:p-4">
            <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-[9px] font-black tracking-wider uppercase text-indigo-900 block mb-0.5">Stripe/Razorpay Verified Receipt</span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                Your online transaction is fully processed and secured. Card tokens are completely tokenized.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-[300px] flex flex-col gap-4 text-xs uppercase tracking-widest font-semibold ml-auto">
            <div className="flex justify-between">
              <span className="text-gray-400">Ledger Subtotal</span>
              <span className="text-black font-semibold">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipping (Clean Snacking)</span>
              <span className="text-black font-semibold">
                {shippingCost === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax Estimate (8%)</span>
              <span className="text-black font-semibold">${estimatedTax.toFixed(2)}</span>
            </div>
            <div className="border-t border-black/10 pt-4 flex justify-between items-center mt-2">
              <span className="text-xs font-black text-[#111]">Grand Total Paid</span>
              <span className="text-2xl font-black text-black">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer note */}
        <div className="border-t border-black/10 pt-12 mt-12 text-center text-[10px] tracking-widest font-semibold uppercase text-gray-400">
          Thank you for snacking organic! Sustento Organics Corp. • CA 90210
        </div>

      </motion.main>
    </div>
  );
}
