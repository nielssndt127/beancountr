"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintButton({ autoPrint }: { autoPrint: boolean }) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 300);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 18px",
        borderRadius: "999px",
        border: "1px solid rgba(31,31,31,0.15)",
        background: "#FDFAF4",
        color: "#1F1F1F",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Printer style={{ width: 14, height: 14 }} />
      Print / Save as PDF
    </button>
  );
}
