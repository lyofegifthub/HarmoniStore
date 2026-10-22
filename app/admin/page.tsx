"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupabaseNotice from "@/components/SupabaseNotice";
import {
  fetchCategories,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  deleteCategory,
} from "@/lib/supabase";
import { Product, Category } from "@/lib/types";
import { formatRupiah, generateSlug } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  ReceiptText,
  Clock,
} from "lucide-react";
import { useOrderStore } from "@/lib/order-store";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders">("products");
  const { orders, updateOrderStatus, fetchOrdersFromSupabase } = useOrderStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Product Form Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category_id: "",
    price: 150000,
    stock: 15,
    image_url: "",
    description: "",
    is_available: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Category Form Modal state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "product" | "category";
    id: string;
    name: string;
  } | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAllData = async () => {
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
      showToast("Gagal memuat data dari database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Stats calculation
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );
  const lowStockProductsCount = products.filter((p) => p.stock <= 5).length;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategoryFilter === "all" ||
      p.category_id === selectedCategoryFilter ||
      p.category?.slug === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.category?.name && p.category.name.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Open modal for Create Product
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      slug: "",
      category_id: categories[0]?.id || "",
      price: 2500000,
      stock: 10,
      image_url:
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
      description: "",
      is_available: true,
    });
    setIsProductModalOpen(true);
  };

  // Open modal for Edit Product
  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id || categories[0]?.id || "",
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || "",
      description: product.description || "",
      is_available: product.is_available,
    });
    setIsProductModalOpen(true);
  };

  // Auto generate slug
  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingProduct) {
      setProductForm((prev) => ({
        ...prev,
        name: val,
        slug: generateSlug(val),
      }));
    } else {
      setProductForm((prev) => ({ ...prev, name: val }));
    }
  };

  // Save Product (Insert or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.slug.trim()) {
      showToast("Nama dan Slug produk wajib diisi", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, {
          name: productForm.name,
          slug: productForm.slug,
          category_id: productForm.category_id,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          image_url: productForm.image_url,
          description: productForm.description,
          is_available: productForm.is_available,
        });

        if (res.success) {
          showToast(`Produk "${productForm.name}" berhasil diperbarui!`);
          setIsProductModalOpen(false);
          await loadAllData();
        } else {
          showToast(res.error || "Gagal memperbarui produk", "error");
        }
      } else {
        const res = await createProduct({
          name: productForm.name,
          slug: productForm.slug,
          category_id: productForm.category_id,
          price: Number(productForm.price),
          stock: Number(productForm.stock),
          image_url: productForm.image_url,
          description: productForm.description,
          is_available: productForm.is_available,
        });

        if (res.success) {
          showToast(`Produk "${productForm.name}" berhasil ditambahkan!`);
          setIsProductModalOpen(false);
          await loadAllData();
        } else {
          showToast(res.error || "Gagal membuat produk baru", "error");
        }
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      showToast("Nama dan Slug kategori wajib diisi", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await createCategory({
        name: catForm.name,
        slug: catForm.slug,
      });

      if (res.success) {
        showToast(`Kategori "${catForm.name}" berhasil ditambahkan!`);
        setIsCatModalOpen(false);
        setCatForm({ name: "", slug: "" });
        await loadAllData();
      } else {
        showToast(res.error || "Gagal membuat kategori", "error");
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Terjadi kesalahan", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm delete execution
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    setFormSubmitting(true);
    try {
      if (deleteTarget.type === "product") {
        const res = await deleteProduct(deleteTarget.id);
        if (res.success) {
          showToast(`Produk "${deleteTarget.name}" berhasil dihapus.`);
          await loadAllData();
        } else {
          showToast(res.error || "Gagal menghapus produk", "error");
        }
      } else {
        const res = await deleteCategory(deleteTarget.id);
        if (res.success) {
          showToast(`Kategori "${deleteTarget.name}" berhasil dihapus.`);
          await loadAllData();
        } else {
          showToast(res.error || "Gagal menghapus kategori", "error");
        }
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus", "error");
    } finally {
      setFormSubmitting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-sky-500 selection:text-white">
      <SupabaseNotice isLiveDb={isLiveDb} />
      <Navbar isLiveDb={isLiveDb} />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-70 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-emerald-500/40"
              : "bg-rose-950 text-white border-rose-500/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black text-sky-600 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HarmoniStore Panel Kendali</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard Admin Toko
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola katalog produk, kategori, harga, dan ketersediaan stok
              dengan mudah.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span>Sinkronkan Data</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Toko Publik</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Produk</p>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {totalProducts}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Katalog aktif
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Package className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Kategori</p>
              <p className="text-3xl font-black text-slate-900 mt-1.5">
                {totalCategories}
              </p>
              <p className="text-[11px] text-indigo-600 font-bold mt-1">
                Kategori terhubung
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Nilai Inventaris
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 truncate max-w-[170px]">
                {formatRupiah(totalInventoryValue)}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">
                Total aset barang
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Stok Menipis
              </p>
              <p className="text-3xl font-black text-amber-600 mt-1.5">
                {lowStockProductsCount}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Stok ≤ 5 unit
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kelola Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kelola Kategori ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pesanan ({orders.length})
            </button>
          </div>

          <div>
            {activeTab === "products" ? (
              <button
                onClick={handleOpenCreateProduct}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            ) : activeTab === "categories" ? (
              <button
                onClick={() => {
                  setCatForm({ name: "", slug: "" });
                  setIsCatModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori Baru</span>
              </button>
            ) : (
              <Link
                href="/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-lg shadow-slate-900/25 transition-all cursor-pointer"
              >
                <ReceiptText className="w-4 h-4" />
                <span>Lihat Tampilan Riwayat Pembeli</span>
              </Link>
            )}
          </div>
        </div>

        {/* PRODUCTS TAB CONTENT */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari produk di tabel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-500 font-bold shrink-0">
                  Filter:
                </span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-sky-500/20 outline-hidden w-full sm:w-auto cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Produk</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Harga</th>
                    <th className="py-4 px-6">Stok</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-400"
                      >
                        Tidak ada data produk yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Thumbnail & Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                              <img
                                src={
                                  p.image_url ||
                                  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200"
                                }
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200";
                                }}
                              />
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <a
                                href={`/product/${p.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5 truncate"
                              >
                                <span>{p.name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <span className="text-[11px] text-slate-400 font-mono block truncate">
                                /{p.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700">
                            {p.category?.name || "Tanpa Kategori"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 font-black text-slate-900 text-sm">
                          {formatRupiah(p.price)}
                        </td>

                        {/* Stock */}
                        <td className="py-4 px-6">
                          <span
                            className={`font-black text-xs ${
                              p.stock <= 5 ? "text-amber-600" : "text-slate-800"
                            }`}
                          >
                            {p.stock} unit
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          {p.is_available && p.stock > 0 ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                              Habis
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Edit Produk"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: "product",
                                  id: p.id,
                                  name: p.name,
                                })
                              }
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB CONTENT */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Nama Kategori</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Jumlah Produk</th>
                    <th className="py-4 px-6 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {categories.map((c) => {
                    const count = products.filter(
                      (p) => p.category_id === c.id || p.category?.slug === c.slug
                    ).length;

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-6 font-black text-slate-900 text-sm">
                          {c.name}
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-500">
                          {c.slug}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700">
                            {count} produk
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: "category",
                                id: c.id,
                                name: c.name,
                              })
                            }
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS TAB CONTENT */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Daftar Pesanan Masuk (Midtrans & Toko)
                </h3>
                <p className="text-xs text-slate-500">
                  Data pesanan dari pembeli, tersimpan di LocalStorage & Supabase Cloud
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchOrdersFromSupabase()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan Pesanan</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">ID Pesanan</th>
                    <th className="py-4 px-6">Pelanggan</th>
                    <th className="py-4 px-6">Rincian Barang</th>
                    <th className="py-4 px-6">Total Bayar</th>
                    <th className="py-4 px-6">Status Pembayaran</th>
                    <th className="py-4 px-6 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        Belum ada pesanan masuk.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-sky-600 block">
                            {o.order_id}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(o.created_at).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-slate-900 block">
                            {o.customer_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {o.customer_phone}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800">
                            {o.items?.length || 0} barang
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {o.items
                              ?.map((it) => `${it.product_name} (${it.quantity}x)`)
                              .join(", ") || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black text-slate-900 text-sm">
                          {formatRupiah(o.total_amount)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black border ${
                              o.payment_status === "settlement"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : o.payment_status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {o.payment_status === "settlement"
                              ? "Lunas (Settlement)"
                              : o.payment_status === "pending"
                              ? "Menunggu Pembayaran"
                              : "Dibatalkan / Expire"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {o.payment_status !== "settlement" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatus(o.order_id, "settlement");
                                  showToast(`Status ${o.order_id} diubah ke LUNAS`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Tandai pesanan lunas"
                              >
                                Set Lunas
                              </button>
                            )}
                            {o.payment_status !== "expire" && (
                              <button
                                onClick={async () => {
                                  await updateOrderStatus(o.order_id, "expire");
                                  showToast(`Status ${o.order_id} dibatalkan`, "error");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Batalkan pesanan"
                              >
                                Batalkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Data akan langsung tersimpan ke database Supabase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mechanical Keyboard Wireless 75%"
                  value={productForm.name}
                  onChange={handleProductNameChange}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="mechanical-keyboard-wireless"
                    value={productForm.slug}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 outline-hidden bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga (Rupiah) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2.5 text-xs font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Stok <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        stock: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2.5 text-xs font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Image URL & Thumbnail Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Gambar (Unsplash / Eksternal)
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden"
                  />
                  {productForm.image_url && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                      <img
                        src={productForm.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan spesifikasi, fitur unggulan, dan kelebihan produk..."
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden resize-none leading-relaxed"
                />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={productForm.is_available}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      is_available: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <label
                  htmlFor="availCheck"
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Tampilkan produk di katalog toko (Ketersediaan Aktif)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="py-3 px-5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="py-3 px-7 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{editingProduct ? "Simpan Perubahan" : "Tambah Produk"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">
                Tambah Kategori Baru
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aksesoris Komputer"
                  value={catForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatForm({
                      name: val,
                      slug: generateSlug(val),
                    });
                  }}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Slug Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="aksesoris-komputer"
                  value={catForm.slug}
                  onChange={(e) =>
                    setCatForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              Konfirmasi Hapus{" "}
              {deleteTarget.type === "product" ? "Produk" : "Kategori"}?
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus &ldquo;
              <strong className="text-slate-800">{deleteTarget.name}</strong>
              &rdquo;? Data yang dihapus tidak dapat dipulihkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={formSubmitting}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/25 disabled:opacity-50"
              >
                {formSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
