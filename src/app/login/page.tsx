"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: CHARCOAL }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: CARD, borderRight: `1px solid ${BORDER}` }}>
        <Link href="/" className="flex items-center">
          <img src="/Wordmark.png" alt="Beancountr" style={{ height: "80px", objectFit: "contain" }} />
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed mb-6" style={{ color: CREAM }}>
            &ldquo;Finally I know exactly what I can spend and what to set aside for tax.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: BORDER, color: CREAM }}>S</div>
            <div>
              <p className="font-medium text-sm" style={{ color: CREAM }}>Sam Okafor</p>
              <p className="text-sm" style={{ color: MUTED }}>Freelance developer, London</p>
            </div>
          </div>
        </div>
        <p className="text-sm" style={{ color: MUTED }}>Planning estimates only — not formal tax advice.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: CHARCOAL }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: MUTED }}>Log in to your account</p>

          <SocialLoginButtons />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  color: CREAM,
                  "--tw-ring-color": CREAM,
                } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: CARD,
                  border: `1px solid ${BORDER}`,
                  color: CREAM,
                  "--tw-ring-color": CREAM,
                } as React.CSSProperties}
              />
            </div>
            {error && (
              <p className="text-sm bg-red-950/50 text-red-400 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: CREAM, color: CHARCOAL }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: MUTED }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: CREAM }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
