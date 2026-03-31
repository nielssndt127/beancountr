"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bc_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("bc_cookie_consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("bc_cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ background: "oklch(0.22 0.008 80)", border: `1px solid ${BORDER}` }}>
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1" style={{ color: CREAM }}>🍪 We use cookies</p>
          <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
            Essential cookies keep the app running. We&apos;d also like to use analytics cookies to improve Beancountr, but only with your consent.{" "}
            <Link href="/privacy" className="underline transition-colors" style={{ color: CREAM }}>
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: MUTED, border: `1px solid ${BORDER}` }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs font-bold px-5 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: CREAM, color: CHARCOAL }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
