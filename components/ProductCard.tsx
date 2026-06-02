import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: any;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const reviewsCount = product.reviews ? product.reviews.length : 0;
  const averageRating = reviewsCount > 0 
    ? product.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / reviewsCount 
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="group cursor-pointer flex flex-col h-full">
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
          <div className="flex items-center gap-1">
            <Star size={10} className={averageRating > 0 ? "fill-amber-400 text-amber-400" : "fill-gray-300 text-gray-300"} />
            <span className="text-[10px] font-bold text-gray-700">{averageRating.toFixed(1)}</span>
            <span className="text-[9px] text-gray-400 font-medium">({reviewsCount} reviews)</span>
          </div>
        </div>
        <span className="text-lg font-bold tracking-tight">${Number(product.price).toFixed(2)}</span>
      </div>
    </Link>
  );
};
