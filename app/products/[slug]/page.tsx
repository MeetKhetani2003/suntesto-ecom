"use client";

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/lib/data';
import { useCart } from '@/lib/CartContext';
import { Footer } from '@/components/Footer';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  
  const product = PRODUCTS.find(p => p.id === slug);
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-[#EFEFE9] flex flex-col pt-24 text-[#111]">
      <main className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full">
        {/* Left: Image Side */}
        <div 
          className="w-full md:w-1/2 h-[60vh] md:h-screen sticky top-0 flex items-center justify-center p-12 overflow-hidden"
          style={{ backgroundColor: product.color }}
        >
          {/* Big Abstract Title Background */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center text-[25vw] font-black tracking-tighter uppercase pointer-events-none select-none"
            style={{ color: product.darkColor }}
          >
            {product.name}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full max-w-lg z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ mixBlendMode: product.isDark ? 'normal' : 'multiply' }}
            />
          </motion.div>
        </div>

        {/* Right: Details Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 py-24 md:py-0">
          <Link href="/products" className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-gray-500 hover:text-black transition-colors mb-12">
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-[6vw] font-black tracking-tighter leading-[0.85] uppercase mb-6 text-[#111]">
              {product.name}
            </h1>
            <p className="text-2xl text-gray-500 mb-8">${product.price}</p>
            
            <p className="text-xl md:text-2xl font-light text-gray-700 leading-relaxed mb-12 max-w-xl">
              {product.desc}
            </p>

            <div className="grid grid-cols-2 gap-8 mb-12 border-t border-b border-black/10 py-8">
              <div>
                <span className="block text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Weight</span>
                <span className="text-lg font-medium">20g (0.7oz)</span>
              </div>
              <div>
                <span className="block text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Ingredients</span>
                <span className="text-lg font-medium">100% {product.name}</span>
              </div>
            </div>

            <button 
              onClick={() => addToCart(product)}
              className="w-full md:w-auto px-12 py-5 rounded-full text-sm font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-4 bg-[#111] text-white hover:scale-[1.02] transition-transform duration-300 shadow-2xl"
            >
              Add to Cart <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
