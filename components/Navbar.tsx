"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Menu, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

// ─── Search Overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load all products once
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        setAllProducts(d.products || []);
        setProducts(d.products?.slice(0, 6) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter on query change
  useEffect(() => {
    if (!query.trim()) {
      setProducts(allProducts.slice(0, 6));
      return;
    }
    const q = query.toLowerCase();
    const filtered = allProducts.filter(
      p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.desc?.toLowerCase().includes(q)
    );
    setProducts(filtered.slice(0, 8));
  }, [query, allProducts]);

  // Focus input & handle Esc
  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleProductClick = (product: any) => {
    router.push(`/products/${product.id}`);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex flex-col items-center pt-24 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 mb-3">
            <Search size={20} className="text-white/50 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search freeze-dried fruits, powders, combos..."
              className="flex-1 bg-transparent text-white placeholder-white/40 text-base font-medium focus:outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                <X size={16} />
              </button>
            )}
            <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors text-[9px] font-black tracking-widest uppercase border border-white/20 px-2 py-1 rounded-lg cursor-pointer">
              ESC
            </button>
          </div>
        </form>

        {/* Results Panel */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-10 text-center">
              <span className="text-white/40 text-xs uppercase tracking-widest font-black">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center">
              <span className="text-white/40 text-xs uppercase tracking-widest font-black">No products found for "{query}"</span>
            </div>
          ) : (
            <>
              <div className="px-4 py-2.5 border-b border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                  {query.trim() ? `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"` : 'Popular products'}
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {products.map((product, i) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                  >
                    {/* Product thumbnail */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 overflow-hidden"
                      style={{ backgroundColor: product.color || '#2a2a2a' }}
                    >
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Search size={16} className="text-white/30" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-sm text-white uppercase tracking-tight block truncate">{product.name}</span>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{product.category}</span>
                    </div>

                    {/* Price + Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-white">₹{product.price}</span>
                      <ArrowRight size={14} className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* View all link */}
              {query.trim() && products.length > 0 && (
                <div className="px-4 py-3 border-t border-white/10">
                  <button
                    onClick={handleSearchSubmit as any}
                    className="w-full text-center text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    View all results for "{query}" →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const { cart, setIsCartOpen } = useCart();
  const { user, login } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Close search on route change
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-8 py-4 md:py-6 transition-all duration-300 text-white ${
          isScrolled
            ? 'bg-[#111]/80 backdrop-blur-md border-b border-white/10'
            : 'mix-blend-difference'
        }`}
      >
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="text-2xl font-black tracking-tighter uppercase cursor-pointer hover:scale-105 transition-transform flex items-center gap-4 w-28 md:w-48">
            <Image src="/logos/SUSTENTO_LOGO_WHITE.png" alt="Sustento" width={1000} height={1000} className="w-full h-auto object-contain" />
          </div>
        </Link>

        <div className="flex gap-4 md:gap-10 items-center font-medium text-xs tracking-[0.2em] uppercase">
          <Link href="/about" className="hidden md:block cursor-pointer hover:opacity-50 transition-opacity">About</Link>
          <Link href="/products" className="hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Products</Link>
          <Link href="/contact" className="hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Contact</Link>

          {user ? (
            <Link href="/profile" className="hidden md:block cursor-pointer hover:opacity-50 transition-opacity">Profile</Link>
          ) : (
            <div className="hidden md:flex gap-6 items-center">
              <button onClick={login} className="cursor-pointer hover:opacity-50 transition-opacity bg-transparent border-none p-0 text-inherit font-medium text-xs tracking-[0.2em] uppercase">Sign In</button>
              <button onClick={login} className="cursor-pointer bg-white text-black px-5 py-2.5 rounded-full hover:bg-white/90 font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-300 shadow-md">Sign Up</button>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center w-9 h-9 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            aria-label="Search products"
          >
            <Search size={15} />
          </button>

          <Link
            href="/cart"
            className="flex items-center gap-3 border border-white/20 px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-white hover:text-black transition-all duration-500"
          >
            <ShoppingBag size={14} />
            <span>Cart ({totalItems})</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all"
          >
            <Menu size={16} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
            className="fixed inset-0 z-[100] bg-[#111] text-white flex flex-col justify-center items-center"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 flex items-center justify-center border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            {/* Mobile Search */}
            <div className="absolute top-6 left-6">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-12 text-center">
              {[
                { href: '/', label: 'Home', delay: 0.3 },
                { href: '/about', label: 'About', delay: 0.4 },
                { href: '/products', label: 'Products', delay: 0.5 },
                { href: '/contact', label: 'Contact', delay: 0.6 },
              ].map(({ href, label, delay }) => (
                <div key={href} className="overflow-hidden">
                  <motion.div initial={{ y: 50 }} animate={{ y: 0 }} transition={{ delay, duration: 0.5 }}>
                    <Link href={href} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl md:text-6xl font-black tracking-tighter uppercase hover:text-amber-200 transition-colors">
                      {label}
                    </Link>
                  </motion.div>
                </div>
              ))}
              <div className="overflow-hidden">
                <motion.div initial={{ y: 50 }} animate={{ y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
                  {user ? (
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl md:text-6xl font-black tracking-tighter uppercase hover:text-amber-200 transition-colors">
                      Profile
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-6 items-center">
                      <button onClick={() => { setIsMobileMenuOpen(false); login(); }} className="text-4xl md:text-6xl font-black tracking-tighter uppercase hover:text-amber-200 transition-colors bg-transparent border-none p-0 text-inherit cursor-pointer">
                        Sign In
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && <SearchOverlay onClose={closeSearch} />}
      </AnimatePresence>
    </>
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
                      <p className="text-white/50 text-xs tracking-widest uppercase mb-3">₹{item.price.toFixed(2)}</p>
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
                  <span className="text-2xl font-black">₹{cartTotal.toFixed(2)}</span>
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
