import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CHARCOAL_MID = "oklch(0.20 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const CARD_LIGHT = "oklch(0.26 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: CHARCOAL }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: MUTED }}>Log in</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: CREAM, color: CHARCOAL }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: CARD, color: CREAM, border: `1px solid ${BORDER}` }}>
          <Star className="w-3.5 h-3.5" />
          14-day free trial on Pro — no card required
        </div>
        <h1 className="text-4xl mb-3" style={{ fontFamily: "var(--font-display)", color: CREAM }}>
          Simple, <span style={{ color: MUTED }}>honest pricing</span>
        </h1>
        <p className="text-lg max-w-md mx-auto" style={{ color: MUTED }}>Start free. Upgrade when you&apos;re ready to grow.</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-6 items-start">

          {/* Free */}
          <div className="rounded-2xl p-7" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: CREAM }}>£0</span>
            </div>
            <p className="text-sm mb-6" style={{ color: MUTED }}>Forever. No card needed.</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2.5 text-sm" style={{ color: CREAM }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
                Unlimited time + expense tracking
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: CREAM }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
                Tax + pension dashboard
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: CREAM }}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
                Up to 3 clients
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: MUTED }}>
                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: BORDER }} />
                Max 5 invoices/month
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: MUTED }}>
                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: BORDER }} />
                Beancountr branding on invoices
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: MUTED }}>
                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: BORDER }} />
                PDF export
              </li>
              <li className="flex items-center gap-2.5 text-sm" style={{ color: MUTED }}>
                <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: BORDER }} />
                Payment reminders
              </li>
            </ul>
            <Link href="/signup" className="block w-full py-3 text-center rounded-xl text-sm font-semibold transition-all" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-7 relative" style={{ background: CARD_LIGHT, border: `2px solid ${CREAM}` }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs px-4 py-1.5 rounded-full font-bold whitespace-nowrap" style={{ background: CREAM, color: CHARCOAL }}>
              ✦ Most popular
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: MUTED }}>Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: CREAM }}>£12</span>
              <span className="mb-1.5 text-sm" style={{ color: MUTED }}>/month</span>
            </div>
            <p className="text-sm mb-6" style={{ color: MUTED }}>or £108/year — save 25%</p>
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
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: CREAM }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: CREAM, color: CHARCOAL }}>
              Start 14-day free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs mt-3" style={{ color: MUTED }}>No credit card required to start</p>
          </div>

        </div>

        {/* FAQ / reassurance */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { q: "Can I upgrade anytime?", a: "Yes. Switch from Free to Pro instantly. Your data carries over." },
            { q: "What happens at the invoice limit?", a: "You'll be prompted to upgrade. No invoices are lost or hidden." },
            { q: "Is it really free forever?", a: "Yes. Free is genuinely free — no time limit, no hidden fees." },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="text-sm font-semibold mb-2" style={{ color: CREAM }}>{q}</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
