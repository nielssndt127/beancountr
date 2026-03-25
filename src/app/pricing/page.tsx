import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "168px", height: "51px", objectFit: "contain" }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-700 font-medium hover:text-stone-900 transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: "oklch(0.72 0.22 48)" }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-4xl font-bold text-stone-900 mb-3">Simple, honest pricing</h1>
        <p className="text-stone-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-stone-900">£0</span>
            </div>
            <p className="text-stone-400 text-sm mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {["1 client", "3 invoices per month", "Dashboard basics"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 text-stone-300 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 text-center rounded-xl text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all">
              Get started
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-7 relative text-white" style={{ background: "oklch(0.72 0.22 48)" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-3 py-1 rounded-full font-medium">
              Most popular
            </div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-4">Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold">£12</span>
              <span className="text-white/70 mb-1.5 text-sm">/month</span>
            </div>
            <p className="text-white/70 text-sm mb-6">or £108/year (save 25%)</p>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited clients",
                "Unlimited invoices",
                "PDF export",
                "Time + expense tracking",
                "Tax reserve planning",
                "Pension reserve planning",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                  <CheckCircle className="w-4 h-4 text-white/70 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3 text-center rounded-xl text-sm font-semibold bg-white transition-all hover:bg-stone-50" style={{ color: "oklch(0.72 0.22 48)" }}>
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Plus */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Plus</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-stone-900">£24</span>
              <span className="text-stone-400 mb-1.5 text-sm">/month</span>
            </div>
            <p className="text-stone-400 text-sm mb-6">or £216/year</p>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Pro",
                "Accountant exports",
                "Multi-business support",
                "Advanced insights",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 text-stone-300 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 text-center rounded-xl text-sm font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-all">
              Get started
            </Link>
          </div>
        </div>
        <p className="text-center text-sm text-stone-400 mt-8">All plans include a 14-day free trial. No credit card required.</p>
      </section>
    </div>
  );
}
