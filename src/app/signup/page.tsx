"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
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
          <img src="/Wordmark.png" alt="Beancountr" style={{ height: "67px", objectFit: "contain" }} />
        </Link>
        <div className="space-y-4">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide">What you get for free</p>
          {[
            "Clean income and profit dashboard",
            "Tax reserve and pension estimates",
            "Invoice generation and tracking",
            "Time and expense logging",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-white/70 flex-shrink-0" />
              <span className="text-white text-sm">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-sm">Planning estimates only — not formal tax advice.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "67px", objectFit: "contain" }} />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-1">Create your account</h1>
          <p className="text-stone-400 text-sm mb-8">Free forever for 1 client</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Alex Smith"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
              />
            </div>
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
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white"
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
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-stone-800 hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-center text-xs text-stone-300 mt-3">
            By signing up you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
