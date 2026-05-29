"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';

export const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 mix-blend-difference text-white"
    >
      <Link href="/">
        <div className="text-2xl font-black tracking-tighter uppercase cursor-pointer hover:scale-105 transition-transform flex items-center gap-4">
           <Image src="/logos/SUSTENTO_LOGO_WHITE.png" alt="Sustento" width={40} height={40} className="w-10 h-auto" />
           Sustento
        </div>
      </Link>
      <div className="flex gap-10 items-center font-medium text-xs tracking-[0.2em] uppercase">
        <Link href="/products" className="hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Products</Link>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-3 border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
        >
          <ShoppingBag size={14} />
          <span>Cart ({totalItems})</span>
        </button>
      </div>
    </motion.nav>
  );
};

export const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111] z-[101] text-white p-8 flex flex-col shadow-2xl border-l border-white/10"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-black tracking-tighter uppercase">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 flex flex-col gap-8 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/50">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p className="tracking-widest uppercase text-xs">Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-24 h-24 rounded-2xl bg-white/5 p-2 flex items-center justify-center shrink-0">
                      <Image src={item.image} alt={item.name} width={80} height={80} className="object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold tracking-tighter uppercase text-lg">{item.name}</h3>
                      <p className="text-white/50 text-xs tracking-widest uppercase mb-3">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-4">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-8 border-t border-white/10 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="uppercase tracking-widest text-xs text-white/50">Subtotal</span>
                  <span className="text-2xl font-black">${cartTotal.toFixed(2)}</span>
                </div>
                <button className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:scale-[1.02] transition-transform">
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
