"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Check, Star, Eye, Zap } from "lucide-react";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock <= 0 || !product.is_available;
  const originalPrice = Math.round(product.price * 1.2); // Simulated MSRP for discount display

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5">
      {/* Clickable Image Preview */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-slate-100"
      >
        <img
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800"
          }
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800";
          }}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          {product.category && (
            <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/60">
              {product.category.name}
            </span>
          )}

          {isOutOfStock ? (
            <span className="ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white shadow-md">
              Habis
            </span>
          ) : product.stock <= 5 ? (
            <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md animate-pulse">
              Sisa {product.stock}
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
              <Zap className="w-3 h-3 fill-white" /> Diskon
            </span>
          )}
        </div>

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-xs font-bold text-slate-900 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-sky-600" /> Lihat Produk
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 text-amber-500 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400"
                />
              ))}
            </div>
            <span className="text-xs font-black text-slate-700 ml-0.5">4.9</span>
            <span className="text-[11px] text-slate-400">(48)</span>
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="block group-hover:text-sky-600 transition-colors"
          >
            <h3 className="font-extrabold text-slate-900 text-base line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Description Snippet */}
          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 line-through block">
              {formatRupiah(originalPrice)}
            </span>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : justAdded
                ? "bg-emerald-600 text-white shadow-emerald-500/30 scale-105"
                : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25 hover:shadow-lg"
            }`}
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Masuk!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
