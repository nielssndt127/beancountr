import Link from "next/link";
import { CheckCircle, Clock, FileText, PoundSterling, Shield, TrendingUp, ArrowRight, Star } from "lucide-react";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CHARCOAL_MID = "oklch(0.20 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: CHARCOAL }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: MUTED }}>Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: MUTED }}>Log in</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: CREAM, color: CHARCOAL }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: CARD, color: CREAM, border: `1px solid ${BORDER}` }}>
              <Star className="w-3.5 h-3.5" />
              Built for UK sole traders and limited companies
            </div>
            <h1 className="text-5xl sm:text-6xl leading-[1.1] mb-6" style={{ fontFamily: "var(--font-display)", color: CREAM }}>
              Know what you earned.<br />
              <span style={{ color: MUTED }}>Know what to save.</span>
            </h1>
            <p className="text-xl max-w-xl mb-10 leading-relaxed" style={{ color: MUTED }}>
              Track your hours, send invoices, and always know how much to set aside for tax and pension — all in one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link href="/signup" className="flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg" style={{ background: CREAM, color: CHARCOAL }}>
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="font-semibold px-7 py-3.5 rounded-xl text-base border-2 transition-all" style={{ color: CREAM, borderColor: BORDER }}>
                See pricing
              </Link>
            </div>
            <p className="text-sm mt-4" style={{ color: MUTED }}>No credit card required · Free forever for 1 client</p>
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 pb-20" style={{ background: CHARCOAL }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border-2 overflow-hidden card-shadow" style={{ borderColor: BORDER }}>
            <div className="px-6 py-3 flex items-center gap-2" style={{ background: CARD }}>
              <div className="w-3 h-3 rounded-full" style={{ background: BORDER }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: BORDER }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: CREAM, opacity: 0.5 }}></div>
              <div className="flex-1 ml-4 rounded-md px-3 py-1 text-xs max-w-xs" style={{ background: "oklch(0.28 0.008 80)", color: MUTED }}>beancountr.com/app/dashboard</div>
            </div>
            <div className="p-6" style={{ background: CARD }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-sans)", color: CREAM }}>Dashboard — March 2025</h3>
                <span className="text-xs" style={{ color: MUTED }}>Demo preview</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Income", value: "£8,500", sub: "This month", valueColor: CREAM },
                  { label: "Tax reserve", value: "£2,125", sub: "25% of profit", valueColor: "oklch(0.78 0.015 80)" },
                  { label: "Safe to spend", value: "£5,525", sub: "After reserves", valueColor: "oklch(0.85 0.02 80)" },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl p-4 card-shadow" style={{ background: "oklch(0.26 0.008 80)", border: `1px solid ${BORDER}` }}>
                    <p className="text-xs mb-1" style={{ color: MUTED }}>{card.label}</p>
                    <p className="text-xl font-bold font-data" style={{ color: card.valueColor }}>{card.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-4" style={{ background: "oklch(0.26 0.008 80)", border: `1px solid ${BORDER}` }}>
                <p className="text-xs font-medium mb-3" style={{ color: MUTED }}>Recent invoices</p>
                {[
                  { num: "INV-003", client: "Acme Corp", amount: "£3,200", status: "Sent", statusColor: { bg: "oklch(0.28 0.008 80)", text: "oklch(0.75 0.015 80)" } },
                  { num: "INV-002", client: "TechStart Ltd", amount: "£2,800", status: "Paid", statusColor: { bg: "oklch(0.28 0.008 80)", text: CREAM } },
                ].map((inv) => (
                  <div key={inv.num} className="flex items-center justify-between py-2 last:border-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                      <span className="text-sm font-medium" style={{ color: CREAM }}>{inv.num}</span>
                      <span className="text-xs ml-2" style={{ color: MUTED }}>{inv.client}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium font-data" style={{ color: CREAM }}>{inv.amount}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: inv.statusColor.bg, color: inv.statusColor.text, border: `1px solid ${BORDER}` }}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 px-6" style={{ background: CHARCOAL_MID }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Sound familiar?</h2>
            <p style={{ color: MUTED }}>You&apos;re not alone. These are the three things every freelancer struggles with.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "😰", title: "Tax time panic", body: "Not sure how much to put away for HMRC? Beancountr calculates a sensible reserve every month so you're never caught short." },
              { icon: "📬", title: "Chasing payments", body: "Losing track of who owes you what? See every unpaid invoice at a glance and mark them paid with one click." },
              { icon: "📊", title: "Spreadsheet chaos", body: "Managing invoices, expenses, and time logs across multiple sheets? Beancountr brings it all into one place." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl p-6 card-shadow card-shadow-hover" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold mb-2 text-lg" style={{ fontFamily: "var(--font-display)", color: CREAM }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Three steps to financial clarity</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { step: "01", icon: Clock, title: "Log your time and expenses", body: "Add time entries as you work. Log expenses as they come in. Takes seconds." },
              { step: "02", icon: FileText, title: "Send professional invoices", body: "Turn logged time into invoices instantly. Export as PDF and send to clients." },
              { step: "03", icon: PoundSterling, title: "See what's yours to spend", body: "The dashboard shows income, tax reserve, pension and safe-to-spend — always up to date." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: CREAM }}>
                  <item.icon className="w-5 h-5" style={{ color: CHARCOAL }} />
                </div>
                <span className="text-xs font-bold tracking-widest mb-2" style={{ color: BORDER }}>{ item.step}</span>
                <h3 className="font-bold mb-2 text-lg" style={{ fontFamily: "var(--font-display)", color: CREAM }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ background: CHARCOAL_MID }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Everything you need, nothing you don&apos;t</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, text: "Income & profit dashboard", sub: "See where you stand at a glance" },
              { icon: Clock, text: "Time tracking", sub: "Log hours by client and project" },
              { icon: FileText, text: "Invoice generation", sub: "Professional PDF invoices" },
              { icon: PoundSterling, text: "Tax reserve planning", sub: "Automatic estimates, UK-focused" },
              { icon: Shield, text: "Pension set-aside", sub: "Pay your future self first" },
              { icon: CheckCircle, text: "Expense tracking", sub: "Categories, deductibility, totals" },
            ].map((item) => (
              <div key={item.text} className="rounded-2xl p-5 card-shadow card-shadow-hover flex items-start gap-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BORDER }}>
                  <item.icon className="w-5 h-5" style={{ color: CREAM }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: CREAM }}>{item.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: CARD, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl mb-4" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Ready to see your money clearly?</h2>
          <p className="mb-8 text-lg" style={{ color: MUTED }}>Start free. No credit card. No accounting degree required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg" style={{ background: CREAM, color: CHARCOAL }}>
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ background: CHARCOAL, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <span style={{ fontFamily: "var(--font-display)", color: CREAM, fontSize: "1.25rem" }}>Beancountr</span>
          </Link>
          <p className="text-sm" style={{ color: MUTED }}>Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: MUTED }}>Pricing</Link>
            <Link href="/privacy" className="text-sm transition-colors" style={{ color: MUTED }}>Privacy</Link>
            <Link href="/login" className="text-sm transition-colors" style={{ color: MUTED }}>Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
