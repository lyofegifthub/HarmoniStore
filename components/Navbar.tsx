"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  Flame,
  ReceiptText,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useAuthStore } from "@/lib/auth-store";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLiveDb?: boolean;
}

export default function Navbar({
  searchQuery = "",
  onSearchChange,
  isLiveDb,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, getTotalItems } = useCartStore();
  const { user, logout, checkSession } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    checkSession();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const totalItems = mounted ? getTotalItems() : 0;
  const isAdmin = pathname.startsWith("/admin");

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    } else if (val.trim() && pathname !== "/") {
      router.push(`/?q=${encodeURIComponent(val)}`);
    }
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white text-[11px] font-semibold py-1.5 px-4 text-center border-b border-white/10 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
          <Flame className="w-3 h-3 text-amber-400" /> PROMO SPESIAL
        </span>
        <span className="hidden sm:inline text-slate-300">
          Bebas Ongkir Seluruh Indonesia & Garansi Resmi 100% Original!
        </span>
        <span className="text-sky-300 font-bold">
          Kode Voucher: <span className="underline tracking-wider font-mono">HARMONI10</span> (Diskon 10%)
        </span>
      </div>

      {/* Main Glass Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo & Brand Identity */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="group flex items-center gap-3 transition-transform active:scale-95"
              >
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white ring-2 ring-emerald-400/20" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-900 bg-clip-text text-transparent">
                    Harmoni<span className="text-sky-600">Store</span>
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 -mt-1">
                    Pusat Alat Musik & Audio
                  </span>
                </div>
              </Link>

              {/* Status Indicator Pill */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border bg-slate-50 text-slate-600 border-slate-200/90 shadow-2xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveDb ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span>{isLiveDb ? "Database Cloud Aktif" : "Mode Demo Lokal"}</span>
              </div>
            </div>

            {/* Real-time Search Input */}
            {!isAdmin && (
              <div className="flex-1 max-w-lg mx-2 sm:mx-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-600 transition-colors">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={localSearch}
                    onChange={handleSearchInput}
                    placeholder="Cari gitar, bass, piano digital, drum, amplifier, senar..."
                    className="w-full pl-11 pr-10 py-2.5 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200/60 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/15 transition-all shadow-inner outline-hidden"
                  />
                  {localSearch ? (
                    <button
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Hapus pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="hidden sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none">
                      <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                        Cari
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions: Admin & Cart */}
            <div className="flex items-center gap-3">
              {/* Order History Link */}
              <Link
                href="/orders"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs hover:shadow-xs ${
                  pathname === "/orders"
                    ? "bg-sky-600 text-white border-sky-600 shadow-sky-500/20"
                    : "text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200/80 border-slate-200/80"
                }`}
                title="Riwayat Belanja & Status Pesanan"
              >
                <ReceiptText className="w-4 h-4" />
                <span className="hidden sm:inline">Riwayat</span>
              </Link>

              {/* Admin Panel Button */}
              {isAdmin ? (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200/80 transition-all shadow-xs"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Halaman Depan</span>
                </Link>
              ) : (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200/80 shadow-2xs hover:shadow-xs"
                  title="Panel Manajemen Admin"
                >
                  <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              {/* User Account / Login Button */}
              {user ? (
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={`Akun: ${user.name} (${user.email})`}
                    aria-expanded={isProfileOpen}
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 hidden sm:inline transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu (Click-toggled with seamless bridge) */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full pt-2 w-56 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
                        <div className="px-3 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user.email}
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                            {user.role === "admin" ? "Admin Toko" : "Pelanggan"}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/orders"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Riwayat Belanja</span>
                          </Link>

                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                              <span>Panel Admin</span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar (Logout)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer"
                  title="Masuk atau Daftar Akun"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Masuk</span>
                </Link>
              )}

              {/* Shopping Cart Button with Animated Counter */}
              {!isAdmin && (
                <button
                  onClick={openCart}
                  className="relative inline-flex items-center justify-center p-3 rounded-2xl text-slate-800 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 border border-slate-200/90 hover:border-sky-300 transition-all active:scale-95 cursor-pointer shadow-xs group"
                  aria-label="Buka Keranjang Belanja"
                >
                  <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-5.5 px-1.5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-md shadow-sky-600/40 ring-2 ring-white animate-pulse">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
