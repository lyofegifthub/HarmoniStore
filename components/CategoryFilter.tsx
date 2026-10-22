"use client";

import React from "react";
import { Category } from "@/lib/types";
import { Layers, Guitar, Music, Disc, Mic, Sparkles } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  productCounts?: Record<string, number>;
}

export default function CategoryFilter({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  productCounts,
}: CategoryFilterProps) {
  // Helper to pick category icons for musical instruments
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "gitar-bass":
        return <Guitar className="w-4 h-4 text-sky-400" />;
      case "keyboard-piano":
        return <Music className="w-4 h-4 text-indigo-400" />;
      case "drum-perkusi":
        return <Disc className="w-4 h-4 text-amber-400" />;
      case "audio-aksesoris":
        return <Mic className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="w-full flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      {/* "All" button */}
      <button
        onClick={() => onSelectCategory("all")}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-2xs ${
          selectedCategorySlug === "all"
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/25 scale-102"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80"
        }`}
      >
        <Layers className="w-4 h-4" />
        <span>Semua Alat Musik</span>
      </button>

      {/* Dynamic Category Chips */}
      {categories.map((category) => {
        const isSelected = selectedCategorySlug === category.slug;
        const count = productCounts ? productCounts[category.id] : undefined;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.slug)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer shadow-2xs ${
              isSelected
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-102"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90"
            }`}
          >
            {getCategoryIcon(category.slug)}
            <span>{category.name}</span>
            {typeof count === "number" && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
