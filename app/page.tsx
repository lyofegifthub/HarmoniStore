"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import SupabaseNotice from "@/components/SupabaseNotice";
import Footer from "@/components/Footer";
import { fetchCategories, fetchProducts } from "@/lib/supabase";
import { Category, Product } from "@/lib/types";
import { Search, PackageOpen, Sparkles, RefreshCw, ArrowUpDown, Shield, Truck, RotateCcw } from "lucide-react";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      setCategories(catRes.data);
      setProducts(prodRes.data);
      setIsLiveDb(catRes.isLive || prodRes.isLive);
    } catch (err) {
      console.error("Error loading products/categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Category check
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.slug === selectedCategory ||
        product.category_id === selectedCategory;

      // Search check
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.category?.name &&
          product.category.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "stock") {
      result.sort((a, b) => b.stock - a.stock);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Count products per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const catId = p.category?.id || p.category_id;
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 font-sans selection:bg-sky-500 selection:text-white">
      {/* Notice regarding Supabase status */}
      <SupabaseNotice isLiveDb={isLiveDb} />

      {/* Responsive Navbar with real-time search */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLiveDb={isLiveDb}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Catalog Section */}
        <section id="catalog-section" className="space-y-6 scroll-mt-28">
          {/* Section Header with Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[11px] font-black text-sky-700 tracking-wider uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Katalog Pilihan Harmoni</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Koleksi Produk Eksklusif
              </h2>
            </div>

            {/* Sorting Dropdown & Refresh */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-transparent outline-hidden cursor-pointer"
                >
                  <option value="featured">Rekomendasi</option>
                  <option value="price-low">Harga: Terendah ke Tertinggi</option>
                  <option value="price-high">Harga: Tertinggi ke Terendah</option>
                  <option value="stock">Stok Paling Melimpah</option>
                </select>
              </div>

              <button
                onClick={loadData}
                title="Refresh produk"
                className="p-2.5 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Category Filter Horizontal Pills */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-200/90 shadow-2xs">
            <CategoryFilter
              categories={categories}
              selectedCategorySlug={selectedCategory}
              onSelectCategory={setSelectedCategory}
              productCounts={productCounts}
            />
          </div>

          {/* Search Query Feedback */}
          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-slate-700 bg-sky-50/80 px-4 py-2.5 rounded-2xl border border-sky-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-600" />
                <span>
                  Menampilkan hasil untuk: &ldquo;
                  <strong className="text-sky-950 font-black">{searchQuery}</strong>&rdquo;
                </span>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
              >
                Hapus Pencarian
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 animate-pulse shadow-xs"
                >
                  <div className="aspect-square bg-slate-200 rounded-2xl w-full" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="pt-2 flex justify-between items-center">
                    <div className="h-6 bg-slate-200 rounded w-1/2" />
                    <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-10 shadow-sm">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <PackageOpen className="w-10 h-10 stroke-[1.4]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                Produk Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Tidak ada produk yang cocok dengan pencarian kata kunci atau kategori yang Anda pilih.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-lg shadow-sky-600/25 cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Shopping Cart Slide-over Drawer */}
      <CartDrawer />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
