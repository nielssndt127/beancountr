"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CheckCircle } from "lucide-react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

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
    <div className="min-h-screen flex">
      {/* Left panel — charcoal */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: CHARCOAL }}>
        <Link href="/" className="flex items-center">
          <img src="/Wordmark.png" alt="Beancountr" style={{ height: "80px", objectFit: "contain" }} />
        </Link>
        <div className="space-y-6">
          <img
            src="/beaver-hero.png"
            alt="Beancountr beaver"
            style={{ width: "220px", mixBlendMode: "lighten", marginBottom: "8px" }}
          />
          <p className="text-lg font-semibold leading-snug" style={{ color: CREAM }}>
            Everything a freelancer needs to stay on top of their finances.
          </p>
          <div className="space-y-3">
            {[
              "Clean income and profit dashboard",
              "Tax reserve and pension estimates",
              "Invoice generation and tracking",
              "Time and expense logging",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
                <span className="text-sm" style={{ color: "rgba(245,241,232,0.75)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: "rgba(245,241,232,0.4)" }}>Planning estimates only — not formal tax advice.</p>
      </div>

      {/* Right panel — cream */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: CREAM }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Create your account</h1>
          <p className="text-sm mb-8" style={{ color: MUTED }}>Free forever for 1 client</p>

          <SocialLoginButtons />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Alex Smith"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  color: CHARCOAL,
                  "--tw-ring-color": GREEN,
                } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  color: CHARCOAL,
                  "--tw-ring-color": GREEN,
                } as React.CSSProperties}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: "#fff",
                  border: `1px solid ${BORDER}`,
                  color: CHARCOAL,
                  "--tw-ring-color": GREEN,
                } as React.CSSProperties}
              />
            </div>
            {error && (
              <p className="text-sm bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-200">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: GREEN, color: "#fff" }}
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: MUTED }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: CHARCOAL }}>
              Log in
            </Link>
          </p>
          <p className="text-center text-xs mt-3" style={{ color: MUTED }}>
            By signing up you agree to our terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
