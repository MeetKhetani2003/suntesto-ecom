"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-40 pb-12 px-8 md:px-24 rounded-t-[3rem] relative z-30 overflow-hidden">
      <div className="absolute bottom-[-10%] left-0 w-full pointer-events-none opacity-5 select-none">
        <h1 className="text-[25vw] font-black leading-none text-center tracking-tighter">SUSTENTO</h1>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-16 border-b border-white/10 pb-24 mb-12 relative z-10">
        <div className="md:w-1/3">
          <Image src="/logos/SUSTENTO_LOGO_WHITE.png" alt="Sustento" width={200} height={80} className="w-48 mb-8 h-auto" />
          <p className="text-gray-400 font-light mb-12 max-w-sm text-lg leading-relaxed">
            Revolutionizing healthy snacking. Preserving nature's best with zero compromises.
          </p>
        </div>

        <div className="flex flex-wrap gap-16 md:gap-24 justify-start md:justify-end">
          <div className="flex flex-col gap-6">
            <span className="font-bold uppercase tracking-[0.2em] text-xs mb-2 text-white/40">Shop</span>
            <Link href="/products" className="hover:text-amber-200 transition-colors tracking-wide">All Products</Link>
          </div>
          <div className="flex flex-col gap-6">
            <span className="font-bold uppercase tracking-[0.2em] text-xs mb-2 text-white/40">About</span>
            <Link href="/about" className="hover:text-amber-200 transition-colors tracking-wide">Our Story</Link>
          </div>
          <div className="flex flex-col gap-6">
            <span className="font-bold uppercase tracking-[0.2em] text-xs mb-2 text-white/40">Support</span>
            <Link href="/contact" className="hover:text-amber-200 transition-colors tracking-wide">Contact</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center text-xs tracking-widest text-white/40 uppercase relative z-10">
        <p>© 2026 Sustento. All rights reserved.</p>
        <div className="flex gap-10 mt-6 md:mt-0">
          <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
        </div>
      </div>
    </footer>
  );
};
