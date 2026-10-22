"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  Sparkles,
  Truck,
  Award,
  ShieldCheck,
  Star,
  Zap,
  Guitar,
  Music,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function HeroBanner() {
  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-slate-800/80">
      {/* Decorative Glow Lighting Orbs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-sky-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-indigo-500/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-18 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left: Text & Features */}
        <div className="max-w-2xl text-center lg:text-left space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 text-xs font-bold shadow-lg shadow-sky-500/10">
            <Music className="w-4 h-4 text-sky-400" />
            <span className="tracking-wide">TOKO ALAT MUSIK & AUDIO RESMI 2026</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Wujudkan Musikalitasmu dengan{" "}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              Alat Musik Terbaik
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            Toko instrumen musik terlengkap untuk musisi pemula hingga profesional. Koleksi resmi gitar elektrik & akustik, piano digital, synthesizer, drum kit, dan kebutuhan audio panggung.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={scrollToCatalog}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <Guitar className="w-4 h-4" />
              <span>Jelajahi Alat Musik</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>

            <a
              href="#catalog-section"
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all hover:border-white/40 shadow-sm"
            >
              Lihat Kategori Musik
            </a>
          </div>

          {/* Value Propositions */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">100% Original</p>
                <p className="text-[11px] text-slate-400">Garansi Distributor Resmi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Packing Kayu Aman</p>
                <p className="text-[11px] text-slate-400">Gratis Ongkir & Asuransi</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">QC & Setting</p>
                <p className="text-[11px] text-slate-400">Langsung Siap Konser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Premium Interactive Spotlight Card */}
        <div className="relative w-full max-w-sm lg:max-w-md">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 group bg-slate-900/60 backdrop-blur-md">
            {/* Spotlight Image */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80"
                alt="Fender Player Stratocaster Spotlight"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Top Floating Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-lg animate-pulse">
                  <Zap className="w-3.5 h-3.5 fill-white" /> BESTSELLER
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  Stok Terbatas: 8 Unit
                </span>
              </div>
            </div>

            {/* Spotlight Details Card */}
            <div className="p-5 space-y-3 bg-slate-950/90 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  Gitar & Bass Pilihan
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>5.0 / 5.0</span>
                </div>
              </div>

              <h4 className="text-base font-extrabold text-white leading-snug">
                Gitar Elektrik Fender Player Stratocaster
              </h4>

              <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 line-through">
                    Rp 13.990.000
                  </div>
                  <div className="text-xl font-black text-sky-400">
                    Rp 11.850.000
                  </div>
                </div>

                <Link
                  href="/product/fender-player-stratocaster"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
