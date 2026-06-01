"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contact')
      .then(r => r.json())
      .then(data => setInquiries(data.inquiries || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-7">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none mb-1">Contact</h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest font-light">{inquiries.length} support messages</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-black" /></div>
      ) : inquiries.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-black/10 rounded-3xl bg-white/40">
          <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">No contact messages yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {inquiries.map((inq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/60 border border-black/5 p-6 rounded-3xl hover:border-black/10 transition-colors"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider block mb-0.5">Support Message</span>
                  <h3 className="text-xl font-black uppercase tracking-tight">{inq.name}</h3>
                </div>
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest shrink-0">
                  {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-light block mb-2">
                Email: <a href={`mailto:${inq.email}`} className="font-semibold text-indigo-600 hover:underline">{inq.email}</a>
              </span>
              {inq.reason && (
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-4">
                  Reason: <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200">{inq.reason}</span>
                </span>
              )}
              {inq.message && (
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Message</span>
                  <p className="text-xs text-gray-700 font-light leading-relaxed">"{inq.message}"</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
