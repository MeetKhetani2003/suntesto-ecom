"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Check, Lock, ShieldCheck, CreditCard, Calendar, Key, User, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading, login } = useAuth();

  // Simple shipping logic (free over $40, otherwise $4.99)
  const shippingThreshold = 40;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 4.99;
  const estimatedTax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingCost + estimatedTax;

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Form State
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Load Razorpay Checkout Script Dynamically on Mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // Clean up script on unmount
      try {
        document.body.removeChild(script);
      } catch (e) {}
    };
  }, []);

  // Dynamic pre-filling based on user account fields
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
      
      // Try to intelligently divide name
      const nameParts = (user.name || '').trim().split(/\s+/);
      if (nameParts.length > 0) {
        setFirstName(nameParts[0]);
        if (nameParts.length > 1) {
          setLastName(nameParts.slice(1).join(' '));
        }
      }
      
      // Parse shipping address
      if (user.address) {
        const parts = user.address.split(',');
        if (parts.length >= 3) {
          setAddress(parts[0].trim());
          setCity(parts[1].trim());
          const zipPart = parts[parts.length - 1].trim().match(/\d{5}/);
          if (zipPart) {
            setZip(zipPart[0]);
          } else {
            setZip(parts[parts.length - 1].trim());
          }
        } else {
          setAddress(user.address);
        }
      }
    }
  }, [user]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;

    setIsProcessing(true);

    try {
      // 1. Call Razorpay backend orders API to register the order payload and hold stock
      const res = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          items: cart.map(item => ({ id: item.id, quantity: item.quantity }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Razorpay order creation failed.');
        setIsProcessing(false);
        return;
      }

      // 2. Configure official Razorpay Checkout Widget options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SvYRmEIlidySNB',
        amount: data.amount,
        currency: data.currency,
        name: 'Sustento Organics',
        description: 'Freeze-Dried Organic Snacking',
        image: '/logos/SUSTENTO_LOGO_WHITE.png', // Fallback to logo image
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Payment authorized successfully!
          // Persist transaction details in MongoDB orders collection
          try {
            const persistRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: response.razorpay_order_id || data.orderId,
                total: grandTotal,
                items: cart.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                  color: item.color
                }))
              })
            });

            if (persistRes.ok) {
              setOrderId(response.razorpay_order_id || data.orderId);
              setIsCompleted(true);
              clearCart();
            } else {
              alert('Payment succeeded, but database order logging failed.');
            }
          } catch (persistErr) {
            console.error('Order persistence error:', persistErr);
            alert('Failed to log order records in database.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone
        },
        theme: {
          color: '#111111'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            // Wire restocking callback on modal dismissal to return held stock back to active inventory
            fetch('/api/payment/razorpay/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderId })
            })
              .then(r => r.json())
              .then(resData => {
                console.log('[Dismiss Restock] Released reservation hold successfully:', resData);
              })
              .catch(err => {
                console.error('[Dismiss Restock Error] Failed to release hold:', err);
              });
          }
        }
      };

      // 4. Trigger Razorpay Checkout pop-up window
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Razorpay checkout error:', error);
      alert('Local gateway transmission error. Please check your workspace server.');
      setIsProcessing(false);
    }
  };

  // 1. Session is verifying
  if (authLoading) {
    return (
      <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Verifying Billing Profile...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Checkout Lock Layout
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
            
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 block mb-1">Billing Restrictions</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Checkout Blocked</h3>
            <p className="text-gray-500 text-xs font-light leading-relaxed mb-8 max-w-xs mx-auto">
              Please authenticate securely using your Google account to confirm billing credentials, enable stripe encryption, and complete checkout.
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

  // 3. Authenticated Active Checkout Page View
  return (
    <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 pb-40">
        
        <Link href="/cart" className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-gray-500 hover:text-black transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Cart
        </Link>

        <AnimatePresence mode="wait">
          {isCompleted ? (
            /* SUCCESS ORDER CONFIRMED SCREEN */
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="max-w-2xl mx-auto w-full py-16 px-8 rounded-[2.5rem] border border-black/10 bg-white/40 backdrop-blur-sm text-center shadow-xl"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mb-8 mx-auto shadow-md"
              >
                <Check size={36} />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Order Confirmed</h2>
              <span className="bg-black text-[#EFEFE9] text-[10px] tracking-[0.2em] font-black px-4 py-1.5 rounded-full uppercase block w-max mx-auto mb-8 font-mono shadow-sm">
                Order ID: {orderId}
              </span>

              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed font-light mb-10">
                Thank you for snacking clean! Your organic order has been successfully placed. We've sent a detailed confirmation receipt to <strong className="font-semibold">{email}</strong>.
              </p>

              {/* Quick receipt summary details */}
              <div className="border border-black/5 rounded-2xl p-6 bg-white/40 mb-10 text-left text-xs uppercase tracking-wider font-semibold max-w-md mx-auto flex flex-col gap-3">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-gray-400">Ship To</span>
                  <span className="text-black font-bold">{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-gray-400">Address</span>
                  <span className="text-black font-bold truncate max-w-[70%]">{address}, {city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Final Paid</span>
                  <span className="text-black font-black">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/products"
                className="px-10 py-4.5 bg-black text-[#EFEFE9] rounded-full text-xs font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-md inline-flex items-center gap-3"
              >
                Continue Snacking <ArrowRight size={14} />
              </Link>
            </motion.div>
          ) : (
            /* ACTIVE CHECKOUT LAYOUT */
            <motion.div
              key="checkout-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row gap-16 items-start"
            >
              {/* LEFT SIDE: Express Checkout Forms */}
              <div className="flex-1 w-full">
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-10">
                  
                  {/* Contact Info Block */}
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Contact Information</span>
                      <div className="flex-1 h-[1px] bg-black/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. alex@example.com"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 382-9901"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info Block */}
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Shipping Details</span>
                      <div className="flex-1 h-[1px] bg-black/10" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">First Name</label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Alex"
                            className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Last Name</label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Mercer"
                            className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Street Address</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 128 Nature Way"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">City / Suburb</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Orchard Valley"
                            className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">ZIP / Postcode</label>
                          <input
                            type="text"
                            required
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="e.g. 90210"
                            className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-black/30 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Razorpay Gateway Information */}
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Razorpay Payment Gateway</span>
                      <div className="flex-1 h-[1px] bg-black/10" />
                    </div>
                    <div className="flex flex-col gap-4 bg-white/40 p-6 rounded-3xl border border-black/5 hover:border-black/10 transition-colors">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <span className="text-[9px] font-black tracking-wider uppercase text-indigo-800 block mb-0.5">Live Razorpay test network active</span>
                          <p className="text-[10.5px] text-gray-500 leading-relaxed font-light">
                            Supports secure payment checkouts using Cards, UPI, NetBanking, and Wallets. Payments are processed in your local test console.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || cart.length === 0}
                    className="w-full bg-[#111] text-[#EFEFE9] py-4 rounded-full font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none mt-6 cursor-pointer"
                  >
                    {isProcessing ? (
                      /* Circular processing loader */
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Initializing Razorpay Checkout Gateway...</span>
                      </div>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Pay Securely with Razorpay</span>
                      </>
                    )}
                  </button>

                </form>
              </div>

              {/* RIGHT SIDE: Sticky Summary list */}
              <aside className="w-full lg:w-[400px] shrink-0 sticky top-36 h-fit bg-white/40 backdrop-blur-sm border border-black/10 rounded-3xl p-8 shadow-sm">
                
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-tighter">Order Review</h3>
                  <span className="text-[10px] font-bold text-gray-400 bg-white/50 border border-black/5 px-2 py-0.5 rounded-full">{totalItems} bags</span>
                </div>

                {/* Grid items */}
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto mb-6 border-b border-black/10 pb-6 pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <div 
                          className="w-12 h-12 rounded-xl p-1 flex items-center justify-center shrink-0 border border-black/5"
                          style={{ backgroundColor: item.color }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs uppercase leading-none mb-1">{item.name}</h4>
                          <span className="text-[9px] text-gray-400 font-bold">Qty: {item.quantity} • ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-6">Your checkout basket is empty.</p>
                  )}
                </div>

                {/* Final price block details */}
                <div className="flex flex-col gap-3.5 text-xs uppercase tracking-widest border-b border-black/10 pb-6 mb-6">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-black font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-black font-semibold">
                      {shippingCost === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Tax Estimate</span>
                    <span className="text-black font-semibold">${estimatedTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-2xl font-black">${grandTotal.toFixed(2)}</span>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase text-emerald-800 block mb-0.5">Razorpay Secured Network</span>
                    <p className="text-[10px] text-emerald-700/80 leading-relaxed font-medium">Bank payments are fully PCI-DSS compliant and secured.</p>
                  </div>
                </div>

              </aside>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}
