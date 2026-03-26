import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";

const ORANGE  = "oklch(0.72 0.22 48)";
const TEAL    = "oklch(0.55 0.22 195)";
const PURPLE  = "oklch(0.52 0.18 290)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "67px", objectFit: "contain" }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-700 font-medium hover:text-stone-900 transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: ORANGE }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: YELLOW_LIGHT, color: "oklch(0.50 0.14 75)" }}>
          <Star className="w-3.5 h-3.5" />
          14-day free trial on Pro — no card required
        </div>
        <h1 className="text-4xl font-bold text-stone-900 mb-3">
          Simple, <span style={{ color: PURPLE }}>honest pricing</span>
        </h1>
        <p className="text-stone-500 text-lg max-w-md mx-auto">Start free. Upgrade when you're ready to grow.</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-6 items-start">

          {/* Free — honest but minimal */}
          <div className="bg-white rounded-2xl p-7 border border-stone-200">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-stone-900">£0</span>
            </div>
            <p className="text-stone-400 text-sm mb-6">Forever. No card needed.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2.5 text-sm text-stone-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
                Unlimited time + expense tracking
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
                Tax + pension dashboard
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-600">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
                Up to 3 clients
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <XCircle className="w-4 h-4 flex-shrink-0 text-stone-200" />
                Max 5 invoices/month
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <XCircle className="w-4 h-4 flex-shrink-0 text-stone-200" />
                Beancountr branding on invoices
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <XCircle className="w-4 h-4 flex-shrink-0 text-stone-200" />
                PDF export
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <XCircle className="w-4 h-4 flex-shrink-0 text-stone-200" />
                Payment reminders
              </li>
            </ul>
            <Link href="/signup" className="block w-full py-3 text-center rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 hover:bg-stone-50 transition-all">
              Get started free
            </Link>
          </div>

          {/* Pro — hero card */}
          <div className="rounded-2xl p-7 relative text-white shadow-2xl" style={{ background: ORANGE }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs px-4 py-1.5 rounded-full font-bold whitespace-nowrap" style={{ background: PURPLE }}>
              ✦ Most popular
            </div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold">£12</span>
              <span className="text-white/70 mb-1.5 text-sm">/month</span>
            </div>
            <p className="text-white/70 text-sm mb-6">or £108/year — save 25%</p>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited clients",
                "Unlimited invoices",
                "No Beancountr branding",
                "Professional PDF invoices",
                "Automated payment reminders",
                "CSV + accountant exports",
                "Tax + pension estimates",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                  <CheckCircle className="w-4 h-4 text-white/80 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-white transition-all hover:bg-stone-50" style={{ color: ORANGE }}>
              Start 14-day free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs text-white/50 mt-3">No credit card required to start</p>
          </div>

        </div>

        {/* FAQ / reassurance */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { q: "Can I upgrade anytime?", a: "Yes. Switch from Free to Pro instantly. Your data carries over." },
            { q: "What happens at the invoice limit?", a: "You'll be prompted to upgrade. No invoices are lost or hidden." },
            { q: "Is it really free forever?", a: "Yes. Free is genuinely free — no time limit, no hidden fees." },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl p-5 border border-stone-100">
              <p className="text-sm font-semibold text-stone-800 mb-2">{q}</p>
              <p className="text-xs text-stone-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
