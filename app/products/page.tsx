"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/lib/data';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-24 pb-40">
        <div className="mb-24">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[8vw] font-black tracking-tighter mb-6 leading-[0.9] uppercase"
          >
            All<br />Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-gray-600 max-w-lg text-lg"
          >
            Explore our complete collection of freeze-dried perfection. No additives, no preservatives, just pure flavor.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {PRODUCTS.map((product, i) => (
            <Link href={`/products/${product.id}`} key={product.id}>
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer flex flex-col"
              >
                <div 
                  className="w-full aspect-[4/5] mb-8 relative overflow-hidden flex items-center justify-center p-12 transition-transform duration-700 ease-out group-hover:scale-[0.96]"
                  style={{ backgroundColor: product.color }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    style={{ mixBlendMode: product.isDark ? 'normal' : 'multiply' }}
                  />
                  
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="flex justify-between items-start border-t border-black/10 pt-6">
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-xs tracking-widest uppercase">Freeze Dried • 20g</p>
                  </div>
                  <span className="text-xl font-medium tracking-tight">${product.price}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
