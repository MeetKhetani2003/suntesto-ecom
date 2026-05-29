"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { IMAGES } from '@/lib/data';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="pt-32 min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col overflow-hidden">
      <main className="flex-1 w-full pb-40">
        
        {/* Header Section */}
        <section className="px-8 md:px-24 max-w-[1400px] mx-auto mb-32">
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[10vw] font-black tracking-tighter leading-[0.8] uppercase mb-12"
          >
            Nature.<br/>
            Uncompromised.
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="max-w-2xl ml-auto border-t border-black/10 pt-8"
          >
            <p className="text-2xl md:text-4xl font-light leading-snug text-gray-700">
              We started Sustento with a singular mission: to capture the pure, explosive flavor of fresh fruit and preserve it perfectly without adding a single thing.
            </p>
          </motion.div>
        </section>

        {/* Image / Values Section */}
        <section className="relative w-full bg-[#111] text-white py-32 rounded-[3rem] px-8 md:px-24 my-20">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-square md:aspect-[3/4] bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center p-12"
            >
              <Image src={IMAGES.mango} alt="Mango Process" width={800} height={800} className="w-full h-full object-contain drop-shadow-2xl" />
              <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            </motion.div>

            <div className="flex flex-col gap-16">
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-amber-200 mb-4">01. Selection</h3>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">Premium Harvest</h2>
                <p className="text-gray-400 text-lg leading-relaxed font-light">We source only the highest grade, perfectly ripe fruits from sustainable farms. If it isn't exceptional fresh, it doesn't make the cut.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-rose-300 mb-4">02. The Process</h3>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">Freeze Dried</h2>
                <p className="text-gray-400 text-lg leading-relaxed font-light">Using cutting-edge vacuum technology, we extract moisture at sub-zero temperatures. This locks in 98% of the nutritional value and intensifies the natural flavor.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-blue-300 mb-4">03. The Promise</h3>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">Zero Additives</h2>
                <p className="text-gray-400 text-lg leading-relaxed font-light">No sugar. No preservatives. No oils. Just one ingredient: the fruit itself. We believe nature got it right the first time.</p>
              </motion.div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
