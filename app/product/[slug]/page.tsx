"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchProductBySlug, fetchProducts } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
  ChevronRight,
  PackageCheck,
  AlertCircle,
  Zap,
  Share2,
  Heart,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadProductDetail() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetchProductBySlug(slug);
        setProduct(res.data);
        setIsLiveDb(res.isLive);

        if (res.data) {
          const relatedRes = await fetchProducts({
            categorySlug: res.data.category?.slug,
          });
          const filtered = (relatedRes.data || [])
            .filter((p) => p.id !== res.data?.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProductDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar isLiveDb={isLiveDb} />
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-slate-200 rounded-3xl" />
            <div className="space-y-5">
              <div className="h-5 bg-slate-200 rounded w-1/4" />
              <div className="h-10 bg-slate-200 rounded w-3/4" />
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-32 bg-slate-200 rounded-2xl w-full" />
              <div className="h-14 bg-slate-200 rounded-2xl w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar isLiveDb={isLiveDb} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Produk Tidak Ditemukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            Produk yang Anda cari tidak tersedia dalam katalog atau tautan yang Anda buka telah kedaluwarsa.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-600/25 hover:bg-sky-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0 || !product.is_available;
  const originalPrice = Math.round(product.price * 1.2);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    openCart();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans">
      <Navbar isLiveDb={isLiveDb} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {product.category && (
            <>
              <Link
                href={`/?category=${product.category.slug}`}
                className="hover:text-sky-600 transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
          <span className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* Product Details Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Left: Product Image Showcase */}
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-md group">
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800";
                  }}
                />

                {/* Stock Status Badge */}
                <div className="absolute top-5 left-5">
                  {isOutOfStock ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg">
                      Stok Habis
                    </span>
                  ) : product.stock <= 5 ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-lg animate-pulse">
                      Sisa {product.stock} Unit Tersisa!
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-lg">
                      Stok Tersedia: {product.stock} Unit
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-5 right-5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg text-slate-700 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right: Info, Price, Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {product.category && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-100">
                    {product.category.name}
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 stroke-amber-400"
                      />
                    ))}
                    <span className="font-black text-slate-800 ml-1.5">5.0</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-xs font-medium">
                    120+ Pembeli Terverifikasi
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                    <PackageCheck className="w-4 h-4" /> 100% Original
                  </span>
                </div>

                {/* Price Box */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-sky-50/50 rounded-3xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    Harga Penawaran Spesial
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatRupiah(originalPrice)}
                    </span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                      Hemat 20%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Tentang Produk Ini
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {product.description ||
                      "Tidak ada deskripsi rinci untuk produk ini."}
                  </p>
                </div>

                {/* Product Highlights */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <span className="text-slate-400 block">Garansi:</span>
                    <span className="font-bold text-slate-800">12 Bulan Toko & Resmi</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <span className="text-slate-400 block">Pengiriman:</span>
                    <span className="font-bold text-slate-800">Instant, Sameday, & Reguler</span>
                  </div>
                </div>
              </div>

              {/* Quantity Stepper & Buttons */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">
                    Jumlah Barang:
                  </span>
                  <div className="flex items-center border border-slate-300 rounded-2xl bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-l-2xl transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-sm font-black text-slate-900 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product.stock || 999, q + 1)
                        )
                      }
                      disabled={
                        quantity >= (product.stock || 999) || isOutOfStock
                      }
                      className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-2xl transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    (Maksimal {product.stock} unit)
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                      isOutOfStock
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                        : justAdded
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/30"
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>Berhasil Ditambahkan!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>+ Masukkan Keranjang</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="py-4 px-8 rounded-2xl font-black text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Beli Sekarang
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-100 text-center">
                  <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold">Garansi Resmi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Bebas Ongkir</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-[11px] text-slate-600">
                    <RotateCcw className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold">7 Hari Retur</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Produk Terkait Pilihan
                </h2>
                <p className="text-xs text-slate-500">
                  Koleksi lain dalam kategori {product.category?.name}
                </p>
              </div>
              <Link
                href="/"
                className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
