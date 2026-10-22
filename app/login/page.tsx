"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Music,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const {
    user,
    isLoading,
    error,
    loginWithSupabase,
    signUpWithSupabase,
    loginAsDemo,
    clearError,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLiveDb = isSupabaseConfigured();

  useEffect(() => {
    setMounted(true);
    clearError();
  }, [clearError]);

  // If already logged in, redirect
  useEffect(() => {
    if (mounted && user) {
      if (user.role === "admin" && redirectPath === "/") {
        router.push("/admin");
      } else {
        router.push(redirectPath);
      }
    }
  }, [mounted, user, router, redirectPath]);

  if (!mounted) return null;

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setClientError("");
    setSuccessMessage("");
    clearError();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setClientError("Email dan kata sandi wajib diisi.");
      return;
    }

    const res = await loginWithSupabase(email, password);
    if (res.success) {
      setSuccessMessage("Berhasil masuk! Mengalihkan ke toko...");
      setTimeout(() => {
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push(redirectPath);
        }
      }, 700);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setClientError("Semua formulir pendaftaran wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setClientError("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    const res = await signUpWithSupabase(email, password, name);
    if (res.success) {
      setSuccessMessage(
        res.message || "Pendaftaran berhasil! Selamat datang di HarmoniStore."
      );
      setTimeout(() => router.push(redirectPath), 800);
    }
  };

  const handleQuickDemo = (role: "admin" | "customer") => {
    loginAsDemo(role);
    setSuccessMessage(
      `Masuk sebagai ${role === "admin" ? "Admin Toko" : "Pelanggan"} berhasil!`
    );
    setTimeout(() => {
      router.push(role === "admin" ? "/admin" : redirectPath);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white">
              Harmoni<span className="text-sky-400">Store</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 -mt-1">
              Pusat Alat Musik
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
        >
          <span>Kembali ke Beranda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-900">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-sky-100 text-sky-800 mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Autentikasi Aman</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {activeTab === "login"
                ? "Selamat Datang Kembali"
                : "Daftar Akun Harmoni"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {activeTab === "login"
                ? "Masuk untuk kelola pesanan & belanja alat musik impian"
                : "Bergabung bersama ribuan musisi di seluruh Indonesia"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daftar Baru
            </button>
          </div>

          {/* Feedback Alerts */}
          {(clientError || error) && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-semibold leading-relaxed">{clientError || error}</span>
              </div>
              {(error?.toLowerCase().includes("rate limit") ||
                clientError?.toLowerCase().includes("rate limit")) && (
                <div className="pt-2 border-t border-rose-200/80 text-[11px] text-slate-700 space-y-1">
                  <p className="font-bold text-rose-900">Solusi Instan di Supabase:</p>
                  <p>
                    Buka Dashboard Supabase &rarr; menu <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Email</strong> &rarr; Matikan toggle <strong>&quot;Confirm email&quot;</strong> &rarr; Klik <strong>Save</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Email Akun
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Gunakan tombol Login Cepat Demo di bawah atau daftar akun baru jika lupa sandi."
                      )
                    }
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Kata Sandi (Minimal 6 karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Atau Uji Coba Cepat (1-Klik)
            </span>
          </div>

          {/* Quick Demo Login Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-900">
                    Masuk Cepat: Admin Toko
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Akses Dashboard & Pengelolaan Produk
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo("customer")}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block font-black text-slate-900">
                    Masuk Cepat: Pelanggan
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Budi Santoso (Riwayat Belanja & Checkout)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        {/* Database Status Tag */}
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveDb ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>
              {isLiveDb
                ? "Autentikasi Cloud Supabase Aktif"
                : "Mode Simulasi Lokal"}
            </span>
          </span>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-500 relative z-10">
        <p>© 2026 HarmoniStore Indonesia. Transaksi Aman & Terenkripsi.</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
