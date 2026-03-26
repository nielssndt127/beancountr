"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "oklch(0.72 0.22 48)" }}>
        <Link href="/" className="flex items-center">
          <img src="/Wordmark.png" alt="Beancountr" style={{ height: "92px", objectFit: "contain" }} />
        </Link>
        <div>
          <blockquote className="text-white text-2xl font-medium leading-relaxed mb-6">
            &ldquo;Finally I know exactly what I can spend and what to set aside for tax.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">S</div>
            <div>
              <p className="text-white font-medium text-sm">Sam Okafor</p>
              <p className="text-white/70 text-sm">Freelance developer, London</p>
            </div>
          </div>
        </div>
        <p className="text-white/50 text-sm">Planning estimates only — not formal tax advice.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/Wordmark.png" alt="Beancountr" style={{ width: "300px", height: "92px", objectFit: "contain" }} />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-400 text-sm mb-8">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                style={{ "--tw-ring-color": "oklch(0.72 0.22 48)" } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
                style={{ "--tw-ring-color": "oklch(0.72 0.22 48)" } as React.CSSProperties}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "oklch(0.72 0.22 48)" }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-stone-800 hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
