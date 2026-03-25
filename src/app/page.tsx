import Link from "next/link";
import { CheckCircle, Clock, FileText, PoundSterling, Shield, TrendingUp, ArrowRight, Star } from "lucide-react";

const ORANGE  = "oklch(0.72 0.22 48)";
const ORANGE_LIGHT = "oklch(0.96 0.07 48)";
const YELLOW  = "oklch(0.83 0.17 85)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";
const TEAL    = "oklch(0.55 0.22 195)";
const TEAL_LIGHT = "oklch(0.94 0.07 195)";
const PURPLE  = "oklch(0.52 0.18 290)";
const PURPLE_LIGHT = "oklch(0.95 0.06 290)";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "168px", height: "51px", objectFit: "contain" }} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-700 font-medium hover:text-stone-900 transition-colors">Log in</Link>
            <Link href="/signup" className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90" style={{ background: ORANGE }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: YELLOW_LIGHT, color: "oklch(0.50 0.14 75)" }}>
              <Star className="w-3.5 h-3.5" />
              Built for UK sole traders and limited companies
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] mb-6 text-stone-900">
              Know what you earned.<br />
              <span style={{ color: ORANGE }}>Know what to save.</span>
            </h1>
            <p className="text-xl text-stone-500 max-w-xl mb-10 leading-relaxed">
              Track your hours, send invoices, and always know how much to set aside for tax and pension — all in one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link href="/signup" className="flex items-center gap-2 font-bold text-white px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg" style={{ background: ORANGE }}>
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="font-semibold text-stone-700 px-7 py-3.5 rounded-xl text-base border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all">
                See pricing
              </Link>
            </div>
            <p className="text-sm text-stone-400 mt-4">No credit card required · Free forever for 1 client</p>
          </div>
          <div className="flex-shrink-0">
            <img src="/Logo.png" alt="Beancountr mascot" style={{ width: "360px", height: "327px", objectFit: "contain" }} />
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border-2 overflow-hidden card-shadow" style={{ borderColor: ORANGE_LIGHT }}>
            <div className="px-6 py-3 flex items-center gap-2" style={{ background: ORANGE_LIGHT }}>
              <div className="w-3 h-3 rounded-full" style={{ background: ORANGE }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: YELLOW }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: TEAL }}></div>
              <div className="flex-1 ml-4 bg-white rounded-md px-3 py-1 text-xs text-stone-400 max-w-xs">beancountr.com/app/dashboard</div>
            </div>
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-stone-800">Dashboard — March 2025</h3>
                <span className="text-xs text-stone-400">Demo preview</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Income", value: "£8,500", sub: "This month", color: "text-stone-900" },
                  { label: "Tax reserve", value: "£2,125", sub: "25% of profit", color: "text-amber-600" },
                  { label: "Safe to spend", value: "£5,525", sub: "After reserves", color: "text-emerald-600" },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl border border-stone-100 p-4 card-shadow">
                    <p className="text-xs text-stone-400 mb-1">{card.label}</p>
                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{card.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-stone-100 p-4">
                <p className="text-xs font-medium text-stone-500 mb-3">Recent invoices</p>
                {[
                  { num: "INV-003", client: "Acme Corp", amount: "£3,200", status: "Sent", statusColor: "bg-blue-50 text-blue-600" },
                  { num: "INV-002", client: "TechStart Ltd", amount: "£2,800", status: "Paid", statusColor: "bg-emerald-50 text-emerald-600" },
                ].map((inv) => (
                  <div key={inv.num} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-stone-700">{inv.num}</span>
                      <span className="text-xs text-stone-400 ml-2">{inv.client}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-stone-800">{inv.amount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.statusColor}`}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points — yellow tint */}
      <section className="py-20 px-6" style={{ background: YELLOW_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Sound familiar?</h2>
            <p className="text-stone-500">You&apos;re not alone. These are the three things every freelancer struggles with.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "😰", title: "Tax time panic", body: "Not sure how much to put away for HMRC? Beancountr calculates a sensible reserve every month so you're never caught short.", dot: ORANGE },
              { icon: "📬", title: "Chasing payments", body: "Losing track of who owes you what? See every unpaid invoice at a glance and mark them paid with one click.", dot: TEAL },
              { icon: "📊", title: "Spreadsheet chaos", body: "Managing invoices, expenses, and time logs across multiple sheets? Beancountr brings it all into one place.", dot: PURPLE },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 card-shadow card-shadow-hover">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-stone-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — white */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Three steps to financial clarity</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { step: "01", icon: Clock, title: "Log your time and expenses", body: "Add time entries as you work. Log expenses as they come in. Takes seconds.", color: ORANGE },
              { step: "02", icon: FileText, title: "Send professional invoices", body: "Turn logged time into invoices instantly. Export as PDF and send to clients.", color: TEAL },
              { step: "03", icon: PoundSterling, title: "See what's yours to spend", body: "The dashboard shows income, tax reserve, pension and safe-to-spend — always up to date.", color: PURPLE },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white" style={{ background: item.color }}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-stone-300 tracking-widest mb-2">{item.step}</span>
                <h3 className="font-bold text-stone-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — teal tint */}
      <section className="py-20 px-6" style={{ background: TEAL_LIGHT }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-3">Everything you need, nothing you don&apos;t</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, text: "Income & profit dashboard", sub: "See where you stand at a glance", bg: ORANGE_LIGHT, color: ORANGE },
              { icon: Clock, text: "Time tracking", sub: "Log hours by client and project", bg: YELLOW_LIGHT, color: "oklch(0.55 0.14 75)" },
              { icon: FileText, text: "Invoice generation", sub: "Professional PDF invoices", bg: TEAL_LIGHT, color: TEAL },
              { icon: PoundSterling, text: "Tax reserve planning", sub: "Automatic estimates, UK-focused", bg: ORANGE_LIGHT, color: ORANGE },
              { icon: Shield, text: "Pension set-aside", sub: "Pay your future self first", bg: PURPLE_LIGHT, color: PURPLE },
              { icon: CheckCircle, text: "Expense tracking", sub: "Categories, deductibility, totals", bg: YELLOW_LIGHT, color: "oklch(0.55 0.14 75)" },
            ].map((item) => (
              <div key={item.text} className="bg-white rounded-2xl p-5 card-shadow card-shadow-hover flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{item.text}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — orange */}
      <section className="py-24 px-6" style={{ background: ORANGE }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to see your money clearly?</h2>
          <p className="mb-8 text-lg text-white/80">Start free. No credit card. No accounting degree required.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg text-stone-900" style={{ background: YELLOW }}>
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <img src="/WordmarkAlt.png" alt="Beancountr" style={{ width: "160px", height: "80px", objectFit: "contain" }} />
          </Link>
          <p className="text-sm text-stone-400">Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
