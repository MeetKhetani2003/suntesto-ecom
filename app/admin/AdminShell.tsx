"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/create-product', label: 'Add Product', icon: PlusCircle },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/wholesale', label: 'Wholesale', icon: Users },
  { href: '/admin/contact', label: 'Contact', icon: MessageSquare },
];

function NavLink({ item, collapsed, onClick }: { item: typeof NAV_ITEMS[0]; collapsed?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-200 group relative ${
        isActive
          ? 'bg-black text-[#EFEFE9] shadow-lg'
          : 'text-gray-500 hover:text-black hover:bg-black/5'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-black text-[#EFEFE9] text-[9px] font-black tracking-widest uppercase rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
          {item.label}
        </div>
      )}
    </Link>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#EFEFE9] text-[#111]">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-40 border-r border-black/10 bg-white/70 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {/* Logo / Brand */}
        <div className={`flex items-center gap-3 px-4 py-6 border-b border-black/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shrink-0">
            <Leaf size={14} className="text-[#EFEFE9]" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-[11px] font-black tracking-[0.2em] uppercase block leading-none">Sustento</span>
              <span className="text-[8px] font-bold text-gray-400 tracking-widest uppercase">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User + Collapse Toggle */}
        <div className="px-3 py-4 border-t border-black/5 flex flex-col gap-2">
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-xl bg-black/5 flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-black text-[#EFEFE9] flex items-center justify-center text-[9px] font-black shrink-0 uppercase">
                {user.email?.charAt(0) || 'A'}
              </div>
              <span className="text-[9px] font-semibold text-gray-600 truncate">{user.email}</span>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={14} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-2xl text-gray-400 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* ===== MOBILE OVERLAY DRAWER ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 h-full w-[260px] z-50 bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-6 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
                    <Leaf size={14} className="text-[#EFEFE9]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black tracking-[0.2em] uppercase block leading-none">Sustento</span>
                    <span className="text-[8px] font-bold text-gray-400 tracking-widest uppercase">Admin Panel</span>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-black cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.href} item={item} onClick={() => setMobileOpen(false)} />
                ))}
              </nav>

              <div className="px-3 py-4 border-t border-black/5 flex flex-col gap-2">
                {user && (
                  <div className="px-3 py-2 rounded-xl bg-black/5 flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-black text-[#EFEFE9] flex items-center justify-center text-[9px] font-black uppercase">
                      {user.email?.charAt(0) || 'A'}
                    </div>
                    <span className="text-[9px] font-semibold text-gray-600 truncate">{user.email}</span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-black tracking-wider uppercase text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT ===== */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'
        } mb-16 md:mb-0`}
      >
        {/* Mobile Top Bar */}
        <div className="flex md:hidden items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Leaf size={12} className="text-[#EFEFE9]" />
            </div>
            <span className="text-[11px] font-black tracking-[0.15em] uppercase">Admin</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-black cursor-pointer p-1">
            <Menu size={20} />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 lg:p-10">
          {children}
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-black/10 flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-black text-[#EFEFE9]' : ''}`}>
                <Icon size={16} />
              </div>
              <span className="text-[7px] font-black tracking-wider uppercase leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
