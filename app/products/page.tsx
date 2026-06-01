"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS } from '@/lib/data';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, ListFilter, Search, X, Star } from 'lucide-react';

export default function ProductsPage() {
  const [productsList, setProductsList] = useState<any[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    async function fetchDynamicProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products) {
          setProductsList(data.products);
        }
      } catch (err) {
        console.error('Error fetching dynamic catalog products:', err);
      }
    }
    fetchDynamicProducts();
  }, []);

  const categories = [
    { id: 'All', label: 'All Products' },
    { id: 'Regular frozen', label: 'Regular Frozen' },
    { id: 'chocolate coated fruits', label: 'Chocolate Coated' },
    { id: 'Fruit Powder', label: 'Fruit Powder' },
    { id: 'Bulk order Listing', label: 'Bulk Packs' },
    { id: 'Combo of Products', label: 'Combos & Sets' },
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'low-high', label: 'Price: Low to High' },
    { id: 'high-low', label: 'Price: High to Low' },
    { id: 'name-asc', label: 'Alphabetical: A-Z' },
  ];

  const getCount = (categoryId: string) => {
    if (categoryId === 'All') return productsList.length;
    return productsList.filter(p => p.category === categoryId).length;
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Filter products based on Category AND Search Query (char-by-char)
  const filteredProducts = productsList.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'low-high') return a.price - b.price;
    if (sortBy === 'high-low') return b.price - a.price;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // featured
  });

  // Pagination calculations
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const element = document.getElementById('products-section-start');
    if (element) {
      const offset = 140; // Offset for fixed navbar + spacing
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex flex-col">
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-8 md:px-16 pb-40">
        
        {/* Header Block */}
        <div id="products-section-start" className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
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
              className="text-gray-600 max-w-lg text-lg font-light"
            >
              Explore our complete collection of freeze-dried perfection. No additives, no preservatives, just pure flavor.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-2 text-xs tracking-[0.2em] font-bold text-gray-400 uppercase"
          >
            <span>Showing {filteredProducts.length} of {productsList.length} items</span>
          </motion.div>
        </div>

        {/* Mobile Filter & Search Bar - Sticky on Mobile Scroll */}
        <div className="md:hidden mb-12 sticky top-[78px] z-30 bg-[#EFEFE9]/95 backdrop-blur-md py-4 -mx-8 px-8 border-b border-black/5 flex flex-col gap-4">
          
          {/* Mobile Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search freeze-dried..."
              className="w-full pl-11 pr-10 py-3 bg-black/5 focus:bg-white rounded-xl text-xs uppercase tracking-widest font-black transition-all border border-transparent focus:border-black/10 focus:outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Horizontal Scrolling Categories */}
          <div className="flex items-center gap-2">
            <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar w-full">
              {categories.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-4 py-2.5 rounded-full text-[10px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                      active 
                        ? 'bg-[#111] text-[#EFEFE9]' 
                        : 'bg-transparent text-gray-600 border border-black/10'
                    }`}
                  >
                    {category.label} <span className="opacity-50 text-[8px] ml-0.5">({getCount(category.id)})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Sorting bar */}
          <div className="flex items-center justify-between border-t border-black/5 pt-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sort By</span>
            <div className="flex overflow-x-auto gap-1 no-scrollbar max-w-[80%]">
              {sortOptions.map((option) => {
                const active = sortBy === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                      active 
                        ? 'bg-black/10 text-[#111]' 
                        : 'bg-transparent text-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Master Grid Layout */}
        <div className="flex flex-col md:flex-row gap-16 items-start">
          
          {/* LEFT SIDEBAR FILTERS (Desktop - Sticky top-36) */}
          <aside className="hidden md:block w-[280px] shrink-0 sticky top-36 h-fit self-start pr-8 z-20">
            
            {/* Search Bar */}
            <div className="mb-10 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-10 py-3.5 bg-black/5 hover:bg-black/[0.08] focus:bg-white rounded-2xl text-xs uppercase tracking-widest font-black transition-all border border-transparent focus:border-black/10 focus:shadow-sm focus:outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-black transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Categories Title */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Category</span>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>

            {/* Categories List */}
            <ul className="flex flex-col gap-2 mb-12">
              {categories.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <li key={category.id} className="relative py-1 flex items-center">
                    {/* Active bullet indicator with spring underline logic */}
                    {active && (
                      <motion.span
                        layoutId="activeCategoryDot"
                        className="absolute left-0 w-2 h-2 rounded-full bg-black"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    
                    <button
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left pl-6 pr-4 py-2 text-sm uppercase tracking-widest font-black transition-all duration-300 flex items-center justify-between group hover:translate-x-1 ${
                        active 
                          ? 'text-black font-extrabold' 
                          : 'text-gray-400 hover:text-black'
                      }`}
                    >
                      <span className="truncate">{category.label}</span>
                      <span className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full border transition-all duration-300 ${
                        active 
                          ? 'border-black bg-black text-[#EFEFE9]' 
                          : 'border-black/10 text-gray-400 group-hover:border-black/30 group-hover:text-black'
                      }`}>
                        {getCount(category.id)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Sorting Section */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-gray-400">Sort By</span>
              <div className="flex-1 h-[1px] bg-black/10" />
            </div>

            {/* Sorting Options */}
            <div className="flex flex-col gap-2">
              {sortOptions.map((option) => {
                const active = sortBy === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`w-full text-left py-2.5 px-3 rounded-xl text-xs uppercase tracking-widest font-black flex items-center justify-between transition-all group ${
                      active 
                        ? 'bg-black/5 text-black' 
                        : 'text-gray-400 hover:text-black hover:bg-black/5'
                    }`}
                  >
                    <span>{option.label}</span>
                    <ChevronRight size={14} className={`opacity-0 transition-all duration-300 ${
                      active 
                        ? 'opacity-100 translate-x-0' 
                        : 'group-hover:opacity-30 group-hover:translate-x-1'
                    }`} />
                  </button>
                );
              })}
            </div>

          </aside>

          {/* PRODUCTS LIST (Grid) */}
          <div className="flex-1 w-full">
            <motion.div 
              layout 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 w-full"
            >
              <AnimatePresence mode="popLayout">
                {paginatedProducts.map((product, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    key={product.id}
                    className="group"
                  >
                    <Link href={`/products/${product.id}`} className="cursor-pointer flex flex-col h-full">
                      <div 
                        className="w-full aspect-[4/5] mb-6 relative overflow-hidden flex items-center justify-center p-10 transition-transform duration-700 ease-out group-hover:scale-[0.96] rounded-3xl"
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
                        
                        {/* Premium Tag for category */}
                        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[9px] uppercase tracking-widest font-black text-gray-600 block leading-none">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-start border-t border-black/10 pt-5 mt-auto">
                        <div>
                          <h3 className="text-xl font-black tracking-tighter uppercase mb-1">{product.name}</h3>
                          <p className="text-gray-500 text-[10px] tracking-widest uppercase font-bold mb-2">Freeze Dried • 20g</p>
                          {(() => {
                            const reviewsCount = product.reviews ? product.reviews.length : 0;
                            const averageRating = reviewsCount > 0 
                              ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewsCount 
                              : 0;
                            return (
                              <div className="flex items-center gap-1">
                                <Star size={10} className={averageRating > 0 ? "fill-amber-400 text-amber-400" : "fill-gray-300 text-gray-300"} />
                                <span className="text-[10px] font-bold text-gray-700">{averageRating.toFixed(1)}</span>
                                <span className="text-[9px] text-gray-400 font-medium">({reviewsCount} reviews)</span>
                              </div>
                            );
                          })()}
                        </div>
                        <span className="text-lg font-bold tracking-tight">${product.price.toFixed(2)}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            
            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-black/10 rounded-[2rem]"
              >
                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">No products found</span>
                <p className="text-gray-500 text-xs max-w-xs">We couldn't find any products matching your category or search query.</p>
              </motion.div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-24 border-t border-black/10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                  Showing {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}–
                  {Math.min(filteredProducts.length, currentPage * itemsPerPage)} of {filteredProducts.length} items
                </span>

                <div className="flex items-center gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="w-12 h-12 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group bg-transparent text-black"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, idx) => {
                      const page = idx + 1;
                      const active = currentPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-12 h-12 rounded-full text-xs font-black transition-all duration-300 ${
                            active
                              ? 'bg-[#111] text-[#EFEFE9] scale-105 shadow-md'
                              : 'bg-transparent text-gray-400 hover:text-black hover:bg-black/5'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="w-12 h-12 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none group bg-transparent text-black"
                  >
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}
