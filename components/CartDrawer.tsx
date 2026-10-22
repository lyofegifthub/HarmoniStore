"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Truck,
  Sparkles,
  Tag,
  Check,
  ReceiptText,
  AlertCircle,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCartStore } from "@/lib/cart-store";
import { useOrderStore } from "@/lib/order-store";
import { useAuthStore } from "@/lib/auth-store";
import { Order } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderStatus, setOrderStatus] = useState<Order["payment_status"]>("settlement");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("midtrans");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Voucher coupon state
  const [voucherInput, setVoucherInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalPrice = Math.max(0, subtotal - discountAmount);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#0284c7", "#6366f1", "#10b981", "#f59e0b"],
      });
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");
    if (voucherInput.trim().toUpperCase() === "HARMONI10") {
      setDiscountPercent(10);
      setVoucherApplied(true);
    } else {
      setVoucherError("Kode voucher tidak valid. Coba: HARMONI10");
    }
  };

  const handleStartCheckout = () => {
    setCheckoutError("");
    if (user) {
      if (!buyerName) setBuyerName(user.name);
      if (!buyerEmail) setBuyerEmail(user.email);
    }
    setIsCheckingOut(true);
  };

  const handleCancelCheckout = () => {
    setIsCheckingOut(false);
    setCheckoutError("");
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCheckoutError("");

    const generatedOrderId = `HRM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Request Midtrans Snap Token dari API route Next.js
      const res = await fetch("/api/midtrans/tokenizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: generatedOrderId,
          customer_name: buyerName,
          customer_email:
            buyerEmail.trim() ||
            `${buyerPhone.replace(/\D/g, "") || "user"}@harmonistore.id`,
          customer_phone: buyerPhone,
          shipping_address: buyerAddress,
          payment_method: paymentMethod,
          gross_amount: finalPrice,
          items: items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            price: it.product.price,
            quantity: it.quantity,
          })),
        }),
      });

      const tokenData = await res.json();

      const newOrder: Order = {
        order_id: generatedOrderId,
        customer_name: buyerName,
        customer_phone: buyerPhone,
        customer_address: buyerAddress,
        payment_method:
          paymentMethod === "midtrans"
            ? "Midtrans Snap (QRIS, VA, E-Wallet)"
            : paymentMethod === "cod"
            ? "Bayar di Tempat (COD)"
            : `Transfer Bank (${paymentMethod.toUpperCase()})`,
        payment_status: "settlement",
        total_amount: finalPrice,
        snap_token: tokenData.token,
        snap_redirect_url: tokenData.redirect_url,
        created_at: new Date().toISOString(),
        items: items.map((it) => ({
          id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_id: it.product.id,
          product_name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image_url: it.product.image_url,
        })),
      };

      // 2. Jika Midtrans Snap Window tersedia dan bukan pure demo dummy
      const win = typeof window !== "undefined" ? (window as any) : null;
      if (
        win?.snap?.pay &&
        tokenData.token &&
        !tokenData.isDemo &&
        paymentMethod === "midtrans"
      ) {
        setIsSubmitting(false);
        win.snap.pay(tokenData.token, {
          onSuccess: async (result: any) => {
            newOrder.payment_status = "settlement";
            await useOrderStore.getState().addOrder(newOrder);
            setOrderId(generatedOrderId);
            setOrderStatus("settlement");
            setOrderSuccess(true);
            clearCart();
            triggerConfetti();
          },
          onPending: async (result: any) => {
            newOrder.payment_status = "pending";
            await useOrderStore.getState().addOrder(newOrder);
            setOrderId(generatedOrderId);
            setOrderStatus("pending");
            setOrderSuccess(true);
            clearCart();
          },
          onError: (error: any) => {
            console.error("Midtrans Snap error:", error);
            setCheckoutError(
              "Pembayaran Midtrans dibatalkan atau mengalami kegagalan."
            );
          },
          onClose: async () => {
            // Pengguna menutup modal Snap sebelum bayar -> simpan sebagai status PENDING
            newOrder.payment_status = "pending";
            await useOrderStore.getState().addOrder(newOrder);
            setOrderId(generatedOrderId);
            setOrderStatus("pending");
            setOrderSuccess(true);
            clearCart();
          },
        });
        return;
      }

      // 3. Mode Fallback / Simulasi (saat kunci Midtrans belum diisi atau user pilih COD/Simulasi)
      newOrder.payment_status =
        paymentMethod === "cod" ? "pending" : "settlement";
      await useOrderStore.getState().addOrder(newOrder);

      setOrderId(generatedOrderId);
      setOrderStatus(newOrder.payment_status);
      setOrderSuccess(true);
      clearCart();
      triggerConfetti();
    } catch (err: any) {
      console.warn("Order checkout error:", err);
      // Simpan offline ke useOrderStore
      const fallbackOrder: Order = {
        order_id: generatedOrderId,
        customer_name: buyerName,
        customer_phone: buyerPhone,
        customer_address: buyerAddress,
        payment_method: "Simulasi Pembayaran HarmoniStore",
        payment_status: "settlement",
        total_amount: finalPrice,
        created_at: new Date().toISOString(),
        items: items.map((it) => ({
          id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_id: it.product.id,
          product_name: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          image_url: it.product.image_url,
        })),
      };
      await useOrderStore.getState().addOrder(fallbackOrder);
      setOrderId(generatedOrderId);
      setOrderStatus("settlement");
      setOrderSuccess(true);
      clearCart();
      triggerConfetti();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAll = () => {
    setOrderSuccess(false);
    setIsCheckingOut(false);
    setVoucherApplied(false);
    setDiscountPercent(0);
    setVoucherInput("");
    closeCart();
  };

  const handleGoToOrders = () => {
    handleFinishAll();
    router.push("/orders");
  };

  return (
    <>
      {/* Dark Backdrop with Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={closeCart}
        />
      )}

      {/* Slide-over Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Keranjang Belanja
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {totalItems} barang terpilih
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Notification Bar */}
        <div className="bg-sky-50 px-6 py-2.5 border-b border-sky-100 flex items-center gap-2 text-xs font-bold text-sky-800">
          <Truck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Selamat! Anda Mendapatkan Gratis Ongkir se-Indonesia</span>
        </div>

        {/* Content Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-5 shadow-inner">
              <ShoppingBag className="w-12 h-12 stroke-[1.3]" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              Keranjang Masih Kosong
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
              Jelajahi berbagai produk pilihan terbaik di HarmoniStore dan
              masukkan ke keranjang belanja Anda!
            </p>
            <button
              onClick={closeCart}
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
            >
              Mulai Belanja Sekarang
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="pt-4 first:pt-0 flex items-center gap-4 group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    <img
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300";
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black tracking-wider text-sky-600 uppercase">
                      {product.category?.name || "Kategori"}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                      {formatRupiah(product.price)}
                    </p>

                    {/* Stepper & Delete */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 shadow-2xs">
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity - 1)
                          }
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-l-xl transition-colors cursor-pointer"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-black text-slate-900 select-none">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product.id, quantity + 1)
                          }
                          disabled={quantity >= (product.stock || 999)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-r-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Code Form */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200/80">
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Kode promo (HARMONI10)"
                    disabled={voucherApplied}
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 outline-hidden disabled:bg-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={voucherApplied || !voucherInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  {voucherApplied ? "Terpasang" : "Gunakan"}
                </button>
              </form>
              {voucherError && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{voucherError}</p>
              )}
              {voucherApplied && (
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Voucher diskon 10% berhasil digunakan!
                </p>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-slate-200 p-6 bg-white space-y-4 shadow-lg">
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-bold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>
                {voucherApplied && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Voucher (10%)</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos Kirim</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    Gratis
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Total Pembayaran</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {formatRupiah(finalPrice)}
                  </span>
                </div>

                <button
                  onClick={handleStartCheckout}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-xl shadow-sky-600/30 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Checkout Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaksi 100% Aman & Terenkripsi</span>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Checkout Simulation Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            {!orderSuccess ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Simulasi Checkout
                      </h3>
                      <p className="text-xs text-slate-500">
                        Masukkan detail pengiriman untuk memproses pesanan
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelCheckout}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitOrder} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Nama Penerima
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1">
                        Email Pembeli <span className="text-slate-400 font-normal">(opsional)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="email@domain.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">
                      Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-slate-700">
                        Metode Pembayaran
                      </label>
                      <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                        Midtrans Gateway Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: "midtrans",
                          label: "Midtrans Snap",
                          sub: "QRIS / VA / CC",
                          badge: "Rekomendasi",
                          highlight: true,
                        },
                        {
                          id: "bca",
                          label: "Virtual Account",
                          sub: "BCA & Mandiri",
                          badge: "Bebas Biaya",
                        },
                        {
                          id: "cod",
                          label: "Bayar di Tempat",
                          sub: "Kurir COD",
                          badge: "Tunai",
                        },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-3 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                            paymentMethod === method.id
                              ? "border-sky-600 bg-sky-50/70 ring-2 ring-sky-600/30 shadow-xs"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800">
                              {method.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {method.sub}
                          </span>
                          <span
                            className={`text-[9px] font-black mt-1.5 w-fit px-1.5 py-0.5 rounded-md ${
                              method.highlight
                                ? "bg-sky-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {method.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Barang:</span>
                      <span className="font-bold">{totalItems} item</span>
                    </div>
                    {voucherApplied && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Potongan Voucher 10%:</span>
                        <span>-{formatRupiah(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Biaya Pengiriman:</span>
                      <span className="font-bold text-emerald-600">Bebas Ongkir (Rp 0)</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black pt-2 border-t border-slate-200 text-sm">
                      <span>Total Bayar:</span>
                      <span className="text-sky-600">{formatRupiah(finalPrice)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancelCheckout}
                      className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-sky-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Bayar via Midtrans</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success Screen */
              <div className="text-center py-6 space-y-4">
                <div className="w-18 h-18 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Pesanan Berhasil Disimpan!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Terima kasih <strong className="text-slate-800">{buyerName || "Pelanggan Setia"}</strong>, pesanan Anda telah tersimpan di riwayat dan siap diproses.
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor Pesanan:</span>
                    <span className="font-mono font-bold text-sky-600">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Pembayaran:</span>
                    <span
                      className={`font-black px-2.5 py-0.5 rounded-full text-[10px] ${
                        orderStatus === "settlement"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {orderStatus === "settlement" ? "LUNAS (BERHASIL)" : "MENUNGGU PEMBAYARAN"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Metode:</span>
                    <span className="font-bold text-slate-800">
                      {paymentMethod === "midtrans" ? "Midtrans Snap Gateway" : paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pembayaran:</span>
                    <span className="font-black text-slate-900">{formatRupiah(finalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimasi Pengiriman:</span>
                    <span className="font-bold text-emerald-600">1 - 2 Hari Kerja</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleGoToOrders}
                    className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ReceiptText className="w-4 h-4" />
                    <span>Lihat di Halaman Riwayat Pesanan</span>
                  </button>

                  <button
                    onClick={handleFinishAll}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Lanjut Belanja di HarmoniStore
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
