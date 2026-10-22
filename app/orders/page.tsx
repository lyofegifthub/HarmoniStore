"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SupabaseNotice from "@/components/SupabaseNotice";
import { useOrderStore } from "@/lib/order-store";
import { useCartStore } from "@/lib/cart-store";
import { Order } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  MapPin,
  Phone,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Receipt,
  ArrowRight,
} from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function OrdersHistoryPage() {
  const { orders, updateOrderStatus, fetchOrdersFromSupabase, isLoading } =
    useOrderStore();
  const { addItem, openCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveDb, setIsLiveDb] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLiveDb(isSupabaseConfigured());
    fetchOrdersFromSupabase();
  }, []);

  if (!mounted) return null;

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePayPendingOrder = (order: Order) => {
    if (!order.snap_token) {
      alert("Token Midtrans tidak tersedia untuk pesanan ini.");
      return;
    }

    if (order.snap_token.startsWith("DEMO-SNAP-")) {
      const confirmPaid = window.confirm(
        `[Mode Simulasi Midtrans]\nApakah Anda ingin menandai pesanan "${order.order_id}" sebagai LUNAS?`
      );
      if (confirmPaid) {
        updateOrderStatus(order.order_id, "settlement");
      }
      return;
    }

    if (window.snap) {
      window.snap.pay(order.snap_token, {
        onSuccess: () => {
          updateOrderStatus(order.order_id, "settlement");
        },
        onPending: () => {
          updateOrderStatus(order.order_id, "pending");
        },
        onError: () => {
          updateOrderStatus(order.order_id, "expire");
        },
        onClose: () => {
          console.log("Customer closed payment popup");
        },
      });
    } else {
      alert("Sedang memuat sistem pembayaran Midtrans. Silakan coba sesaat lagi.");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.payment_status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.order_id.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.items.some((item) => item.product_name.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order["payment_status"]) => {
    switch (status) {
      case "settlement":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lunas / Berhasil</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      case "expire":
      case "cancel":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{status === "expire" ? "Kedaluwarsa" : "Dibatalkan"}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-sky-500 selection:text-white">
      <SupabaseNotice isLiveDb={isLiveDb} />
      <Navbar isLiveDb={isLiveDb} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black uppercase tracking-wider mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>HarmoniStore Pelanggan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Riwayat Belanja & Pesanan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau status pembayaran Midtrans dan detail barang belanjaan Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrdersFromSupabase()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl overflow-x-auto scrollbar-none">
            {[
              { id: "all", label: "Semua", count: orders.length },
              {
                id: "settlement",
                label: "Lunas",
                count: orders.filter((o) => o.payment_status === "settlement").length,
              },
              {
                id: "pending",
                label: "Menunggu",
                count: orders.filter((o) => o.payment_status === "pending").length,
              },
              {
                id: "expire",
                label: "Batal / Expired",
                count: orders.filter(
                  (o) => o.payment_status === "expire" || o.payment_status === "cancel"
                ).length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 font-bold">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nomor order / produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 stroke-[1.4]" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Belum Ada Riwayat Pesanan
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Anda belum melakukan pemesanan, atau tidak ada pesanan yang sesuai dengan filter pencarian.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-lg shadow-sky-600/25 transition-all"
            >
              <span>Jelajahi Produk Musik Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Order Card Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-slate-900 font-mono flex items-center gap-1.5">
                      {order.order_id}
                      <button
                        onClick={() => handleCopyOrderId(order.order_id)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Salin ID Pesanan"
                      >
                        {copiedId === order.order_id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.payment_status)}</div>
                </div>

                {/* Items List */}
                <div className="p-5 sm:p-6 divide-y divide-slate-100 space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="pt-4 first:pt-0 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={
                            item.image_url ||
                            "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300"
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.quantity} x {formatRupiah(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Info */}
                <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Penerima:</span>{" "}
                      {order.customer_name} ({order.customer_phone})
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {order.customer_address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Metode Bayar:</span>{" "}
                      {order.payment_method}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Total & Actions */}
                <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">
                      Total Belanja
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      {formatRupiah(order.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.payment_status === "pending" && (
                      <button
                        onClick={() => handlePayPendingOrder(order)}
                        className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md shadow-sky-600/25 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Sekarang (Midtrans)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                    >
                      Cetak Nota
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <Footer />
    </div>
  );
}
