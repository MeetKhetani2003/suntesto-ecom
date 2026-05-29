"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <div className="pt-32 min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col">
      <main className="flex-1 w-full pb-40">
        <div className="max-w-[1400px] mx-auto px-8 md:px-24 flex flex-col md:flex-row gap-20">
          
          {/* Left Column - Typography */}
          <div className="w-full md:w-1/2">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[8vw] font-black tracking-tighter leading-[0.8] uppercase mb-12"
            >
              Get<br/>
              In Touch
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="flex flex-col gap-12 text-lg font-light"
            >
              <div>
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Inquiries</h3>
                <a href="mailto:hello@sustento.com" className="text-3xl font-medium hover:text-amber-600 transition-colors">hello@sustento.com</a>
              </div>
              
              <div>
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Wholesale</h3>
                <a href="mailto:wholesale@sustento.com" className="text-3xl font-medium hover:text-amber-600 transition-colors">wholesale@sustento.com</a>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Location</h3>
                <p className="text-2xl font-medium">123 Orchard Way<br/>Los Angeles, CA 90001</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full md:w-1/2 pt-12 md:pt-0"
          >
            {formState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-center bg-[#111] text-white rounded-[3rem] p-12"
              >
                <div className="w-20 h-20 rounded-full border-4 border-amber-200 flex items-center justify-center text-amber-200 mb-8">
                  <span className="text-3xl font-black">✓</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Message Sent</h2>
                <p className="text-gray-400 font-light text-xl">Thank you for reaching out. We will get back to you shortly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-12 bg-white p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-black/5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="border-b-2 border-black/10 py-4 bg-transparent outline-none focus:border-black transition-colors text-xl font-medium"
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    className="border-b-2 border-black/10 py-4 bg-transparent outline-none focus:border-black transition-colors text-xl font-medium"
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">Message</label>
                  <textarea 
                    id="message" 
                    required 
                    rows={4}
                    className="border-b-2 border-black/10 py-4 bg-transparent outline-none focus:border-black transition-colors text-xl font-medium resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button 
                  disabled={formState === 'submitting'}
                  className="w-full bg-[#111] text-white py-6 rounded-full font-bold uppercase tracking-[0.2em] text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {formState === 'submitting' ? 'Sending...' : 'Send Message'} <ArrowRight size={16} />
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
