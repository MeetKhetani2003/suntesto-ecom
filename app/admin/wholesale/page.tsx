"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Inbox, Users } from 'lucide-react';

export default function AdminWholesalePage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bulk-inquiry')
      .then(r => r.json())
      .then(data => setInquiries(data.inquiries || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-7">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Wholesale</h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-light">{inquiries.length} bulk inquiry leads</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>
      ) : inquiries.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-black/10 rounded-3xl bg-white/40">
          <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">No wholesale leads yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((inq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/60 border border-black/5 p-6 rounded-3xl hover:border-black/10 transition-colors relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-4 py-1.5 text-[8px] font-black tracking-widest uppercase rounded-bl-2xl">
                Wholesale Lead
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider block mb-0.5">Company / Client</span>
                  <h3 className="text-xl font-black uppercase tracking-tight">{inq.name}</h3>
                  {inq.organization && (
                    <span className="text-xs text-gray-500 font-light">Organization: <strong className="font-semibold text-black">{inq.organization}</strong></span>
                  )}
                </div>
                <div>
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider block mb-0.5">Target Qty</span>
                  <span className="text-lg font-black">{inq.quantity} bags</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4">
                <span>Email: <a href={`mailto:${inq.email}`} className="font-semibold text-amber-600 hover:underline">{inq.email}</a></span>
                <span>Date: <strong className="text-black">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A'}</strong></span>
              </div>
              {inq.message && (
                <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Requirement</span>
                  <p className="text-xs text-gray-700 italic font-light leading-relaxed">"{inq.message}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
