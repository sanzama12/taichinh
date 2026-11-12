"use client";

import * as React from "react";
import { Check } from "lucide-react";

export interface CategoryFilterItem {
  id: string;
  label: string;
}

interface FinFlowCategoryFilterProps {
  categories?: CategoryFilterItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const defaultCategories: CategoryFilterItem[] = [
  { id: "all", label: "All Categories" },
  { id: "housing", label: "Housing & Dining" },
  { id: "transport", label: "Transport" },
  { id: "entertainment", label: "Entertainment" },
];

export function FinFlowCategoryFilter({
  categories = defaultCategories,
  activeId,
  onSelect,
}: FinFlowCategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 font-semibold shadow-2xs"
                : "bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
            }`}
          >
            {isActive && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

