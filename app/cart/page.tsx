"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { Footer } from '@/components/Footer';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  // Simple shipping logic (free over $40, otherwise $4.99)
  const shippingThreshold = 40;
  const shippingCost = cartTotal >= shippingThreshold || cartTotal === 0 ? 0 : 4.99;
  const estimatedTax = cartTotal * 0.08;
  const grandTotal = cartTotal + shippingCost + estimatedTax;

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 pb-40">
        
        {/* Header Block */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[8vw] font-black tracking-tighter mb-6 leading-[0.9] uppercase"
            >
              Shopping<br />Cart
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-gray-600 max-w-lg text-lg font-light"
            >
              Review your freeze-dried organic treats. Add more items, adjust quantities, or proceed to express checkout.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-2 text-xs tracking-[0.2em] font-bold text-gray-400 uppercase"
          >
            <span>Total {totalItems} items in your basket</span>
          </motion.div>
        </div>

        {/* Master Flex Grid */}
        <AnimatePresence mode="wait">
          {cart.length === 0 ? (
            /* EMPTY CART STATE */
            <motion.div 
              key="empty-cart"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-black/10 rounded-[2.5rem] bg-white/20 backdrop-blur-sm px-6"
            >
              <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mb-6 text-gray-400">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Your Cart is Empty</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-light mb-8">
                It looks like you haven't added any of our freeze-dried goodness to your cart yet. Let's change that!
              </p>
              <Link 
                href="/products"
                className="px-10 py-4.5 bg-black text-[#EFEFE9] rounded-full text-xs font-black tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-md inline-flex items-center gap-3"
              >
                <ArrowLeft size={14} /> Continue Snacking
              </Link>
            </motion.div>
          ) : (
            /* CART CONTENTS */
            <motion.div 
              key="cart-contents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-16 items-start"
            >
              
              {/* LEFT SIDE: Cart Items List */}
              <div className="flex-1 w-full flex flex-col gap-6">
                <div className="hidden md:grid grid-cols-12 pb-4 border-b border-black/10 text-[9px] font-black tracking-widest uppercase text-gray-400 px-4">
                  <span className="col-span-6">Product Details</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 rounded-3xl border border-black/5 bg-white/40 backdrop-blur-sm hover:border-black/10 transition-all duration-300 relative group"
                    >
                      {/* Product details thumbnail & info */}
                      <div className="col-span-1 md:col-span-6 flex gap-4 md:gap-6 items-center">
                        <div 
                          className="w-24 h-24 rounded-2xl p-2 flex items-center justify-center shrink-0 border border-black/5"
                          style={{ backgroundColor: item.color }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="object-contain w-full h-full drop-shadow-md" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400 block mb-1">
                            {item.category}
                          </span>
                          <h4 className="text-xl font-black uppercase tracking-tighter leading-none mb-1.5">{item.name}</h4>
                          <span className="text-[10px] text-gray-500 font-bold">Freeze-Dried • 20g Bag</span>
                        </div>
                      </div>

                      {/* Quantity dial counters */}
                      <div className="col-span-1 md:col-span-2 flex justify-center items-center gap-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-[#EFEFE9] transition-colors bg-white text-black"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black hover:text-[#EFEFE9] transition-colors bg-white text-black"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Single Price */}
                      <div className="col-span-1 md:col-span-2 text-left md:text-right flex md:block justify-between items-center border-t border-black/5 md:border-none pt-3 md:pt-0">
                        <span className="md:hidden text-[9px] font-black tracking-widest uppercase text-gray-400">Unit Price</span>
                        <span className="font-semibold text-sm">${item.price.toFixed(2)}</span>
                      </div>

                      {/* Item Total */}
                      <div className="col-span-1 md:col-span-2 text-left md:text-right flex md:block justify-between items-center border-t border-black/5 md:border-none pt-3 md:pt-0">
                        <span className="md:hidden text-[9px] font-black tracking-widest uppercase text-gray-400">Subtotal</span>
                        <span className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>

                      {/* Trash Bin Delete trigger */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-4 right-4 md:static md:col-span-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center self-center"
                      >
                        <Trash2 size={15} />
                      </button>

                    </motion.div>
                  ))}
                </div>

                {/* Continue Snacking Link */}
                <Link 
                  href="/products" 
                  className="mt-4 inline-flex items-center gap-3 text-xs tracking-widest uppercase font-black text-gray-500 hover:text-black transition-colors self-start pl-4 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                </Link>
              </div>

              {/* RIGHT SIDE: Cart Totals Summary */}
              <aside className="w-full lg:w-[400px] shrink-0 sticky top-36 h-fit bg-white/40 backdrop-blur-sm border border-black/10 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Order Summary</h3>

                {/* Totals table detail */}
                <div className="flex flex-col gap-4 border-b border-black/10 pb-6 mb-6 text-xs uppercase tracking-widest">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-black font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-black font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-extrabold">FREE</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <span className="text-[9px] font-bold text-gray-400 lowercase italic normal-case block -mt-2.5">
                      Spend ${(shippingThreshold - cartTotal).toFixed(2)} more for free shipping!
                    </span>
                  )}

                  <div className="flex justify-between items-center font-bold">
                    <span className="text-gray-400">Estimated Tax (8%)</span>
                    <span className="text-black font-semibold">${estimatedTax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-3xl font-black text-black">${grandTotal.toFixed(2)}</span>
                </div>

                {/* Secure Checkout lock message */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start mb-6">
                  <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase text-emerald-800 block mb-0.5">Secure Checkout Guaranteed</span>
                    <p className="text-[10px] text-emerald-700/80 leading-relaxed font-medium">Your personal details are encrypted and encrypted using dynamic tokens.</p>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-[#111] text-[#EFEFE9] py-4 rounded-full font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-xl flex items-center justify-center gap-3"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>

              </aside>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
      <Footer />
    </div>
  );
}
