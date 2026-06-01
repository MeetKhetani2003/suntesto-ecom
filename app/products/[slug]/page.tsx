"use client";

import React, { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, Review } from '@/lib/data';
import { useCart } from '@/lib/CartContext';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Star, Send, X, Check, ShoppingCart, HelpCircle, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

import { useEffect } from 'react';

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const { user, login } = useAuth();
  const router = useRouter();
  
  const staticProduct = PRODUCTS.find(p => p.id === slug);
  const [productData, setProductData] = useState<any>(staticProduct || null);
  const [loadingProduct, setLoadingProduct] = useState(!staticProduct);
  const [notFoundState, setNotFoundState] = useState(false);

  // Active gallery image state
  const [activeImage, setActiveImage] = useState<string>(staticProduct?.image || '');

  // Reviews state (allows adding new ones in component memory)
  const [reviewsList, setReviewsList] = useState<Review[]>(staticProduct?.reviews || []);

  useEffect(() => {
    async function fetchRealTimeProduct() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success && data.products) {
          const dbProduct = data.products.find((p: any) => p.id === slug);
          if (dbProduct) {
            setProductData(dbProduct);
            if (!activeImage) setActiveImage(dbProduct.image);
            if (reviewsList.length === 0) setReviewsList(dbProduct.reviews || []);
            setLoadingProduct(false);
          } else if (!staticProduct) {
            setNotFoundState(true);
            setLoadingProduct(false);
          }
        } else if (!staticProduct) {
          setNotFoundState(true);
          setLoadingProduct(false);
        }
      } catch (err) {
        console.error('Error fetching dynamic product details:', err);
        if (!staticProduct) {
          setNotFoundState(true);
          setLoadingProduct(false);
        }
      }
    }
    fetchRealTimeProduct();
  }, [slug, staticProduct, activeImage, reviewsList.length]);

  if (notFoundState) return notFound();

  // If we are loading a dynamic admin-created product, render a sleek glassmorphic skeleton
  if (loadingProduct || !productData) {
    return (
      <div className="pt-32 min-h-screen bg-[#EFEFE9] text-[#111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Loading Product Specifications...</span>
        </div>
      </div>
    );
  }

  // Map dynamic product state to local product variable for seamless backward compatibility
  const product = productData;

  // New review form state
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Add toast state for cart addition feedback
  const [showToast, setShowToast] = useState(false);

  // Bulk inquiry modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkName, setBulkName] = useState('');
  const [bulkEmail, setBulkEmail] = useState('');
  const [bulkOrg, setBulkOrg] = useState('');
  const [bulkQty, setBulkQty] = useState('');
  const [bulkMsg, setBulkMsg] = useState('');
  const [bulkSubmitted, setBulkSubmitted] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Premium Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Buy Now express checkout handler
  const handleBuyNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addToCart(product);
    router.push('/checkout');
  };

  // Submit new review handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
  };

  // Submit bulk inquiry handler (dispatches email securely via Nodemailer API)
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkName.trim() || !bulkEmail.trim() || !bulkQty.trim()) return;

    setIsBulkSubmitting(true);
    try {
      const res = await fetch('/api/bulk-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bulkName,
          email: bulkEmail,
          organization: bulkOrg,
          quantity: bulkQty,
          message: bulkMsg
        })
      });

      if (res.ok) {
        setBulkSubmitted(true);
        setTimeout(() => {
          setIsBulkModalOpen(false);
          setBulkName('');
          setBulkEmail('');
          setBulkOrg('');
          setBulkQty('');
          setBulkMsg('');
          setBulkSubmitted(false);
        }, 2500);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to dispatch wholesale inquiry. Please try again.');
      }
    } catch (error) {
      console.error('SMTP wholesale inquiry error:', error);
      alert('Network transmission error. Please check your connection.');
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Calculate discount percentage
  const discountPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  // Compute average rating
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : '5.0';

  return (
    <div className="min-h-screen bg-[#EFEFE9] flex flex-col pt-24 text-[#111]">
      <main className="flex-1 flex flex-col md:flex-row max-w-[1600px] mx-auto w-full relative">
        
        {/* Left Side: Dynamic Gallery & Abstract Background */}
        <div 
          className="w-full md:w-1/2 relative md:sticky md:top-24 h-[60vh] md:h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden"
          style={{ backgroundColor: product.color }}
        >
          {/* Large Abstract Background Title */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center text-[25vw] font-black tracking-tighter uppercase pointer-events-none select-none"
            style={{ color: product.darkColor }}
          >
            {product.name}
          </motion.h2>

          {/* Active Featured Image Display */}
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1 max-w-md z-10 flex items-center justify-center relative min-h-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={activeImage} 
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ mixBlendMode: product.isDark && activeImage === product.image ? 'normal' : 'multiply' }}
            />
          </motion.div>

          {/* Clickable Image Gallery Thumbnails */}
          {product.gallery.length > 1 && (
            <div className="flex gap-4 mt-6 justify-center z-20 relative shrink-0">
              {product.gallery.map((imgUrl: string, idx: number) => {
                const isSelected = activeImage === imgUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden p-2 transition-all duration-300 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-white border-2 border-black scale-105 shadow-md' 
                        : 'bg-white/40 border border-black/10 hover:border-black/30'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`${product.name} gallery ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Details, Specs, Form, & Reviews */}
        <div className="w-full md:w-1/2 flex flex-col justify-start px-8 md:px-20 py-16 md:py-24 max-h-[none] overflow-y-auto">
          
          <Link href="/products" className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-bold text-gray-500 hover:text-black transition-colors mb-12">
            <ArrowLeft size={14} /> Back to Products
          </Link>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Category Breadcrumb */}
            <span className="block text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 mb-2">
              {product.category}
            </span>

            {/* Product Title */}
            <h1 className="text-5xl md:text-[5vw] font-black tracking-tighter leading-[0.85] uppercase mb-4 text-[#111]">
              {product.name}
            </h1>

            {/* Average Review Star Display */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-600">{avgRating} / 5 ({reviewsList.length} reviews)</span>
            </div>

            {/* Price Display with Discount Support */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-black">${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-600 text-[10px] tracking-[0.2em] font-black uppercase px-2.5 py-1 rounded-full border border-red-200">
                    Save {discountPct}%
                  </span>
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl font-light text-gray-700 leading-relaxed mb-10 max-w-xl">
              {product.desc}
            </p>

            {/* Dynamic Inventory Stock Banner */}
            <div className="mb-6 flex items-center gap-3">
              {product.stock !== undefined ? (
                product.stock === 0 ? (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Out of Stock
                  </span>
                ) : product.stock <= 10 ? (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full animate-pulse">
                    ⚠️ Only {product.stock} left in stock!
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    ✓ In Stock ({product.stock} available)
                  </span>
                )
              ) : (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                  ✓ In Stock
                </span>
              )}
            </div>

            {/* Actions: Add to Cart and Buy Now */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-8 py-4.5 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3 border border-black hover:bg-black hover:text-[#EFEFE9] transition-all duration-300 bg-transparent text-black disabled:opacity-50 disabled:pointer-events-none"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 px-8 py-4.5 rounded-full text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3 bg-[#111] text-[#EFEFE9] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:pointer-events-none"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>

            {/* Bulk Order Inquiry Trigger */}
            <button 
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  setBulkName(user.name || '');
                  setBulkEmail(user.email || '');
                  setIsBulkModalOpen(true);
                }
              }}
              className="w-full text-center py-4 border border-dashed border-black/10 hover:border-black/30 rounded-2xl text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-black transition-all mb-14 bg-transparent cursor-pointer"
            >
              ✉ Inquire for Bulk / Wholesale Orders
            </button>

            {/* Specs Table */}
            <div className="mb-14">
              <h3 className="text-xs font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Product Specifications</h3>
              <div className="border border-black/10 rounded-2xl overflow-hidden bg-white/40 backdrop-blur-sm">
                <table className="w-full text-left text-xs uppercase tracking-wider">
                  <tbody>
                    <tr className="border-b border-black/5">
                      <td className="px-5 py-4 font-black text-gray-500 w-1/3">Ingredients</td>
                      <td className="px-5 py-4 text-black font-semibold">{product.details.ingredients}</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="px-5 py-4 font-black text-gray-500">Nutrients</td>
                      <td className="px-5 py-4 text-black font-semibold">Calories: {product.details.calories} • Sugar: {product.details.sugar}</td>
                    </tr>
                    <tr className="border-b border-black/5">
                      <td className="px-5 py-4 font-black text-gray-500">Shelf Life</td>
                      <td className="px-5 py-4 text-black font-semibold">{product.details.shelfLife}</td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 font-black text-gray-500">Source</td>
                      <td className="px-5 py-4 text-black font-semibold">Harvested in {product.details.origin}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-black/10 pt-14">
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-8">User Reviews</h3>

              {/* Review Submission Form */}
              <form onSubmit={handleReviewSubmit} className="mb-12 bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-black/10">
                <h4 className="text-xs font-black tracking-[0.2em] uppercase text-gray-400 mb-4">Write a Review</h4>
                
                {/* Rating selection stars */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-gray-500">Rating:</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const active = hoverRating !== null ? starValue <= hoverRating : starValue <= reviewRating;
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setReviewRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-amber-500 focus:outline-none transition-transform hover:scale-115"
                        >
                          <Star size={18} fill={active ? "currentColor" : "none"} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields */}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white px-4 py-2.5 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-black/30"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your thoughts about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:border-black/30 resize-none"
                  />
                  <button
                    type="submit"
                    className="w-max px-6 py-2.5 bg-black text-[#EFEFE9] rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-black/80 transition-colors ml-auto mt-2"
                  >
                    Submit Review <Send size={10} />
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="flex flex-col gap-6">
                <AnimatePresence initial={false}>
                  {reviewsList.map((review) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      key={review.id}
                      className="border-b border-black/5 pb-6 last:border-b-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-black uppercase">{review.userName}</h4>
                          <span className="text-[9px] font-bold text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              size={10} 
                              fill={idx < review.rating ? "currentColor" : "none"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed font-light">{review.comment}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {reviewsList.length === 0 && (
                  <p className="text-xs text-gray-400 italic text-center py-6">No reviews yet. Be the first to share your review!</p>
                )}
              </div>
            </div>

          </motion.div>
        </div>

      </main>

      {/* Recommended Products Section */}
      <section className="w-full max-w-[1600px] mx-auto px-8 md:px-20 py-20 border-t border-black/10 mt-10">
        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center md:text-left">You May Also Like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.filter(p => p.id !== product.id).slice(0, 4).map(p => (
            <Link href={`/products/${p.id}`} key={p.id} className="group flex flex-col h-full cursor-pointer">
              <div 
                className="w-full aspect-[4/5] mb-6 relative overflow-hidden flex items-center justify-center p-8 transition-transform duration-700 ease-out group-hover:scale-[0.98] rounded-3xl"
                style={{ backgroundColor: p.color }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={p.image} 
                  alt={p.name}
                  className="w-full h-full object-contain drop-shadow-xl transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  style={{ mixBlendMode: p.isDark ? 'normal' : 'multiply' }}
                />
              </div>
              <div className="flex justify-between items-start pt-2 px-2">
                <div>
                  <h4 className="font-black uppercase tracking-tighter text-lg">{p.name}</h4>
                  <p className="text-gray-500 text-[10px] tracking-widest uppercase font-bold">{p.category}</p>
                </div>
                <span className="font-bold">${p.price.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />

      {/* Absolute Glassmorphic Bulk Order Inquiry Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            
            {/* Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-[#EFEFE9] rounded-3xl p-8 border border-black/10 shadow-2xl z-10 text-[#111]"
            >
              <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-[#EFEFE9] transition-all"
              >
                <X size={16} />
              </button>

              {bulkSubmitted ? (
                /* Success Screen */
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mb-6 shadow-md"
                  >
                    <Check size={28} />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Inquiry Submitted</h3>
                  <p className="text-gray-500 text-xs max-w-xs leading-relaxed font-light">Thank you! Your bulk order inquiry has been received. Our wholesale team will reach out to you within 24 hours.</p>
                </motion.div>
              ) : (
                /* Inquiry Form */
                <>
                  <div className="mb-8">
                    <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 block mb-1">Wholesale Solutions</span>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Bulk Order Inquiry</h3>
                  </div>

                  <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={bulkName}
                          onChange={(e) => setBulkName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Work Email</label>
                        <input
                          type="email"
                          required
                          value={bulkEmail}
                          onChange={(e) => setBulkEmail(e.target.value)}
                          placeholder="e.g. john@business.com"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Organization</label>
                        <input
                          type="text"
                          value={bulkOrg}
                          onChange={(e) => setBulkOrg(e.target.value)}
                          placeholder="e.g. Nature Foods Inc."
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Estimated Volume</label>
                        <input
                          type="text"
                          required
                          value={bulkQty}
                          onChange={(e) => setBulkQty(e.target.value)}
                          placeholder="e.g. 500 pouches / 50kg"
                          className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-black/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black tracking-wider uppercase text-gray-400">Requirements & Message</label>
                      <textarea
                        rows={4}
                        value={bulkMsg}
                        onChange={(e) => setBulkMsg(e.target.value)}
                        placeholder="Tell us about your custom packaging, delivery timeline, or fruit selection needs..."
                        className="w-full bg-white/60 focus:bg-white border border-black/10 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-black/30 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isBulkSubmitting}
                      className="w-full bg-black text-[#EFEFE9] py-3.5 rounded-full font-black text-xs tracking-widest uppercase mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isBulkSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching Inquiry...</span>
                        </>
                      ) : (
                        <span>Send Bulk Inquiry</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Absolute Premium Glassmorphic Auth Lock Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-[#EFEFE9] rounded-[2.5rem] p-8 border border-black/10 shadow-2xl z-10 text-center text-[#111]"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 w-10 h-10 border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-[#EFEFE9] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="w-16 h-16 rounded-full bg-amber-100/50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 mx-auto shadow-sm">
                <Lock size={24} />
              </div>
              
              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 block mb-1">Google Session Required</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Unlock Organic Snacking</h3>
              <p className="text-gray-500 text-xs font-light leading-relaxed mb-8 max-w-xs mx-auto">
                To protect your shopping bag, coordinate card checkouts, or submit wholesale inquiries, please authenticate securely with Google first.
              </p>
              
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  login();
                }}
                className="w-full bg-[#111] text-[#EFEFE9] py-4 rounded-full font-black text-xs tracking-widest uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
              >
                {/* Custom inline premium Google SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.87 5.87 0 018 11.77a5.87 5.87 0 015.99-5.76c1.62 0 3.016.633 4.095 1.637l2.42-2.323C18.922 3.864 16.597 3 14 3 9.03 3 5 6.927 5 11.77c0 4.841 4.03 8.767 9 8.767 5.22 0 8.74-3.557 8.74-8.653 0-.585-.05-1.148-.15-1.6h-10.35z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Added to Cart Success Toast Overlay */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-10 right-10 z-[250] bg-[#111] text-white py-4 px-6 rounded-2xl flex items-center gap-4 border border-white/10 shadow-2xl"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100/10 text-emerald-400 flex items-center justify-center">
              <Check size={16} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">{product.name} Added</span>
              <span className="text-[10px] text-gray-400 block leading-none mt-0.5">Item added to your shopping cart.</span>
            </div>
            <Link 
              href="/cart"
              className="ml-4 bg-white text-black text-[9px] font-black tracking-widest uppercase px-3 py-2 rounded-lg hover:scale-105 transition-transform"
            >
              View Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
