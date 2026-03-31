import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: "rgba(245,241,232,0.6)" }}>Log in</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: CARD, color: CHARCOAL, border: `1px solid ${BORDER}` }}>
          <Star className="w-3.5 h-3.5" style={{ color: GREEN }} />
          14-day free trial on Pro, no card required
        </div>
        <h1 className="text-4xl mb-3" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>
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
              <span className="text-4xl font-bold" style={{ color: CHARCOAL }}>£0</span>
            </div>
            <p className="text-sm mb-6" style={{ color: MUTED }}>Forever. No card needed.</p>
            <ul className="space-y-3 mb-8">
              {([
                [true, "Manual invoicing"],
                [true, "Manual expense tracking"],
                [true, "Time tracking"],
                [true, "Tax and pension estimates"],
                [true, "Up to 3 clients"],
                [false, "More than 5 invoices per month"],
                [false, "Send invoices by email"],
                [false, "\"Viewed\" delivery tracking"],
                [false, "Your own logo on invoices"],
                [false, "CSV exports"],
                [false, "Automated payment reminders"],
              ] as [boolean, string][]).map(([included, label]) => (
                <li key={label} className="flex items-center gap-2.5 text-sm" style={{ color: included ? CHARCOAL : MUTED }}>
                  {included
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />
                    : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(31,31,31,0.2)" }} />
                  }
                  {label}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block w-full py-3 text-center rounded-full text-sm font-semibold transition-all hover:opacity-80" style={{ color: CHARCOAL, border: `1px solid ${BORDER}` }}>
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-7 relative" style={{ background: CHARCOAL, border: `2px solid ${CHARCOAL}` }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs px-4 py-1.5 rounded-full font-bold whitespace-nowrap" style={{ background: GREEN, color: "#fff" }}>
              ✦ Most popular
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(245,241,232,0.5)" }}>Pro</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold" style={{ color: CREAM }}>£12</span>
              <span className="mb-1.5 text-sm" style={{ color: "rgba(245,241,232,0.5)" }}>/month</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(245,241,232,0.5)" }}>or £108/year (save 25%)</p>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Unlimited clients",
                "Unlimited invoices",
                "Send invoices by email",
                "\"Viewed\" delivery tracking",
                "Your own logo, no Beancountr branding",
                "CSV exports for your accountant",
                "Automated payment reminders",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: CREAM }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: GREEN }} />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-bold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
              Start 14-day free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs mt-3" style={{ color: "rgba(245,241,232,0.4)" }}>No credit card required to start</p>
          </div>

        </div>

        {/* FAQ / reassurance */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
          {[
            { q: "Can I upgrade anytime?", a: "Yes. Switch from Free to Pro instantly. Your data carries over." },
            { q: "What happens at the invoice limit?", a: "You'll be prompted to upgrade. No invoices are lost or hidden." },
            { q: "Is it really free forever?", a: "Yes. Free is genuinely free with no time limit and no hidden fees." },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="text-sm font-semibold mb-2" style={{ color: CHARCOAL }}>{q}</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
