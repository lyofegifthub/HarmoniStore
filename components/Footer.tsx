import React from "react";
import { Sparkles, Heart, Shield, Headphones, RefreshCw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Feature perks bar */}
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">100% Produk Asli</h5>
              <p className="text-xs text-slate-500">Jaminan originalitas dari brand resmi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">Garansi Tukar 7 Hari</h5>
              <p className="text-xs text-slate-500">Bebas klaim jika terjadi cacat pabrik</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">Bantuan Ramah 24/7</h5>
              <p className="text-xs text-slate-500">Layanan pelanggan siap mendampingi</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">Kurasi Premium</h5>
              <p className="text-xs text-slate-500">Hanya produk dengan review terbaik</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Harmoni<span className="text-sky-600">Store</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Toko alat musik dan perlengkapan audio panggung resmi terpercaya. Menyediakan gitar, piano digital, drum, synthesizer, dan aksesoris musik bergaransi resmi untuk kepuasan berkarya Anda.
            </p>
          </div>

          {/* Nav Links */}
          <div>
            <h6 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Jelajahi
            </h6>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="/" className="hover:text-sky-600 transition-colors">
                  Semua Produk
                </a>
              </li>
              <li>
                <a href="#catalog-section" className="hover:text-sky-600 transition-colors">
                  Kategori Unggulan
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-sky-600 transition-colors">
                  Dashboard Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h6 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Metode Pembayaran
            </h6>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                QRIS
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                BCA
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                Mandiri
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                COD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Didukung integrasi database modern Supabase & Next.js App Router.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} HarmoniStore. Seluruh hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk pengalaman belanja terbaik
          </p>
        </div>
      </div>
    </footer>
  );
}
