"use client";

import React, { useState } from "react";
import { Database, CheckCircle2, ChevronRight, X, Copy, Check } from "lucide-react";

interface SupabaseNoticeProps {
  isLiveDb: boolean;
}

export default function SupabaseNotice({ isLiveDb }: SupabaseNoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (dismissed) return null;

  const handleCopyEnv = () => {
    const text = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLiveDb) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200/80 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Database Supabase Terhubung Aktif. Semua data dan operasi belanja tersinkronisasi secara cloud.
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-emerald-600 hover:text-emerald-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-950">Mode Demonstrasi Lokal:</strong>{" "}
            Supabase belum dihubungkan di <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env.local</code>. Menampilkan data lokal bawaan.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-800 hidden md:inline">
            Jalankan <code className="bg-amber-100 px-1 rounded font-mono">schema.sql</code> di SQL Editor Supabase & isi .env.local
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-1 rounded hover:bg-amber-100"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
