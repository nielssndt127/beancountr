"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ORANGE = "oklch(0.72 0.22 48)";
const TEAL   = "oklch(0.55 0.22 195)";

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
      <div className="max-w-4xl mx-auto bg-stone-900 text-white rounded-2xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">🍪 We use cookies</p>
          <p className="text-xs text-stone-400 leading-relaxed">
            Essential cookies keep the app running. We&apos;d also like to use analytics cookies to improve Beancountr — only with your consent.{" "}
            <Link href="/privacy" className="underline text-stone-300 hover:text-white transition-colors">
              Privacy policy
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-xs text-stone-400 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg border border-stone-700 hover:border-stone-500"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-xs font-bold text-white px-5 py-2 rounded-lg transition-all hover:opacity-90"
            style={{ background: ORANGE }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
