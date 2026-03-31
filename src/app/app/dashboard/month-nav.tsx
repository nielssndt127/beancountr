"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MUTED  = "oklch(0.45 0.01 80)";
const BORDER = "oklch(0.88 0.015 80)";
const CARD   = "oklch(0.97 0.015 80)";

export function MonthNav({ year, month }: { year: number; month: number }) {
  const router = useRouter();

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  function go(offset: number) {
    const d = new Date(year, month + offset, 1);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.push(`/app/dashboard?month=${str}`);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(-1)}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
        style={{ border: `1px solid ${BORDER}`, background: CARD, color: MUTED }}
        title="Previous month"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {!isCurrentMonth && (
        <button
          onClick={() => go(1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ border: `1px solid ${BORDER}`, background: CARD, color: MUTED }}
          title="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
