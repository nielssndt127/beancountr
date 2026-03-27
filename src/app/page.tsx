"use client";

import Link from "next/link";
import {
  TrendingUp,
  Clock,
  FileText,
  PoundSterling,
  Shield,
  CheckCircle,
  Calculator,
  Mail,
  LayoutGrid,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

// Design system colours
const C = {
  cream: "#F5F1E8",
  charcoal: "#1F1F1F",
  green: "#4F7D6A",
  lightGreen: "#E6F2ED",
  amber: "#D4A373",
  lightAmber: "#F6E7D8",
  khaki: "#EAE3D2",
  cardBg: "#FBF8F2",
  white: "#FFFFFF",
  muted: "#6B6458",
  mutedLight: "#8C8278",
} as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: C.cream, borderBottom: `1px solid ${C.khaki}` }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center">
          <img
            src="/Wordmark.png"
            alt="Beancountr"
            style={{ height: "60px", objectFit: "contain" }}
          />
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "Blog"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: C.muted }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: C.muted }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
            style={{ background: C.green, color: C.cream }}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function DashboardPreview() {
  return (
    <div
      className="w-full"
      style={{
        background: C.cardBg,
        borderRadius: "32px",
        border: `1.5px solid ${C.khaki}`,
        boxShadow: "0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)",
        padding: "20px",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 mb-4 px-1"
      >
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#E8C4B8" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F0D9A0" }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#B4D4B8" }} />
        <div
          className="ml-3 flex-1 rounded-full px-3 py-1 text-xs max-w-[200px]"
          style={{ background: C.khaki, color: C.muted }}
        >
          beancountr.com/dashboard
        </div>
      </div>

      {/* Top row: Income + badge */}
      <div className="flex gap-3 mb-3">
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: C.white, border: `1px solid ${C.khaki}` }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: C.muted }}>This month</p>
          <p className="text-2xl font-bold" style={{ color: C.charcoal, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>
            £4,820.00
          </p>
          <p className="text-xs mt-1" style={{ color: C.muted }}>Total income</p>
        </div>
        <div
          className="rounded-2xl p-4 flex flex-col justify-center items-center"
          style={{ background: C.lightGreen, minWidth: "90px" }}
        >
          <p className="text-lg font-bold" style={{ color: C.green }}>+12%</p>
          <p className="text-xs text-center mt-0.5" style={{ color: C.green }}>vs last<br />month</p>
        </div>
      </div>

      {/* Middle row: Tax reserve + Safe to spend */}
      <div className="flex gap-3 mb-3">
        {/* Tax reserve */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: C.lightAmber, border: `1px solid #EDCDA6` }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: C.amber }}>Tax reserve</p>
          <p className="text-xl font-bold" style={{ color: C.charcoal, fontFamily: "var(--font-mono)" }}>£1,205</p>
          <div className="mt-2 rounded-full overflow-hidden" style={{ background: "#EDCDA6", height: "6px" }}>
            <div className="h-full rounded-full" style={{ background: C.amber, width: "25%" }} />
          </div>
          <p className="text-xs mt-1" style={{ color: C.amber }}>25% of income</p>
        </div>

        {/* Safe to spend */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: C.charcoal }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: "#8BAF9E" }}>Safe to spend</p>
          <p className="text-xl font-bold" style={{ color: C.cream, fontFamily: "var(--font-mono)" }}>£3,615</p>
          <p className="text-xs mt-1" style={{ color: "#8BAF9E" }}>After reserves</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: C.green }}>
            <span className="text-xs font-semibold" style={{ color: C.cream }}>All clear</span>
          </div>
        </div>
      </div>

      {/* Bottom row: invoices + ledger card */}
      <div className="flex gap-3">
        {/* Recent invoices */}
        <div
          className="flex-1 rounded-2xl p-4"
          style={{ background: C.white, border: `1px solid ${C.khaki}` }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>Recent invoices</p>
          {[
            { num: "INV-014", client: "Acme Co", amount: "£2,400", status: "Paid", statusBg: C.lightGreen, statusColor: C.green },
            { num: "INV-015", client: "StartupHQ", amount: "£1,800", status: "Sent", statusBg: C.lightAmber, statusColor: C.amber },
          ].map((inv) => (
            <div
              key={inv.num}
              className="flex items-center justify-between py-1.5"
              style={{ borderBottom: `1px solid ${C.khaki}` }}
            >
              <div>
                <span className="text-xs font-semibold" style={{ color: C.charcoal }}>{inv.num}</span>
                <span className="text-xs ml-1.5" style={{ color: C.muted }}>{inv.client}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: C.charcoal, fontFamily: "var(--font-mono)" }}>{inv.amount}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: inv.statusBg, color: inv.statusColor }}
                >
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ledger card (slightly rotated) */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between"
          style={{
            background: C.khaki,
            minWidth: "90px",
            transform: "rotate(2deg)",
            transformOrigin: "bottom right",
          }}
        >
          {/* Pen SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-0.5 rounded mb-1.5" style={{ background: C.muted, opacity: 0.3 }} />
            ))}
            <p className="text-xs font-semibold" style={{ color: C.muted }}>Ledger</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="pt-32 pb-24 px-6"
      style={{ background: C.cream }}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">
        {/* Left: text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full mb-6"
            style={{ background: C.lightAmber, color: C.amber }}
          >
            Built for UK freelancers
          </div>

          {/* H1 */}
          <h1
            className="leading-[1.05] mb-6 font-black"
            style={{
              fontFamily: "var(--font-display)",
              color: C.charcoal,
              fontSize: "clamp(52px, 6vw, 84px)",
            }}
          >
            Know what you earned.
            <br />
            Know what to save.
          </h1>

          {/* Subtext */}
          <p
            className="text-lg max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0"
            style={{ color: C.muted }}
          >
            Track hours, send invoices, and see exactly what&apos;s safe to spend — without the spreadsheet chaos or tax panic.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-6">
            <Link
              href="/signup"
              className="flex items-center gap-2 font-bold px-7 py-3.5 rounded-full text-base transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: C.green, color: C.cream }}
            >
              See what you can safely spend <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="font-semibold px-7 py-3.5 rounded-full text-base border-2 transition-all hover:opacity-80"
              style={{ color: C.charcoal, borderColor: C.khaki, background: C.white }}
            >
              See pricing
            </Link>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {[
              "Freelancers already tracking £48k+",
              "Free plan · 1 client · 5 invoices/month",
            ].map((text) => (
              <span
                key={text}
                className="text-xs font-medium px-4 py-2 rounded-full"
                style={{ background: C.khaki, color: C.muted }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Right: dashboard preview */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const testimonials = [
    { quote: "Finally I know exactly what I can spend after tax", name: "Sarah K.", role: "Freelance Designer" },
    { quote: "Took me 5 minutes to set up. Dashboard is brilliant.", name: "Tom R.", role: "Dev Consultant" },
    { quote: "Best £12 I spend each month. No more tax surprises.", name: "Maya P.", role: "Copywriter" },
  ];
  const badges = [
    { icon: "🔒", label: "GDPR compliant" },
    { icon: "🇬🇧", label: "UK tax rates built in" },
    { icon: "⚡", label: "5 min setup" },
    { icon: "💳", label: "Cancel anytime" },
  ];

  return (
    <section className="py-20 px-6" style={{ background: C.khaki }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl font-black text-center mb-10"
          style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
        >
          Trusted by freelancers across the UK
        </h2>

        {/* Testimonials */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl p-6"
              style={{ background: C.white, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <p className="text-sm leading-relaxed mb-4" style={{ color: C.charcoal }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm font-bold" style={{ color: C.charcoal }}>{t.name}</p>
                <p className="text-xs" style={{ color: C.muted }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{ background: C.cream, color: C.muted }}
            >
              <span>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const painPoints = [
    {
      icon: Calculator,
      title: "Tax time panic",
      body: "Not sure how much to put away for HMRC? Never be caught short again.",
    },
    {
      icon: Mail,
      title: "Chasing payments",
      body: "Losing track of who owes you what? See every unpaid invoice at a glance.",
    },
    {
      icon: LayoutGrid,
      title: "Spreadsheet chaos",
      body: "Managing invoices and time logs across sheets? Bring it all into one place.",
    },
  ];

  return (
    <section className="py-20 px-6" style={{ background: C.cream }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-black mb-3"
            style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
          >
            Sound familiar?
          </h2>
          <p className="text-base" style={{ color: C.muted }}>
            You&apos;re not alone. These are the three things every UK freelancer struggles with.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {painPoints.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-6"
              style={{ background: C.lightAmber, border: `1px solid #EDCDA6` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: C.amber }}
              >
                <item.icon className="w-5 h-5" style={{ color: C.cream }} />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{item.body}</p>
            </div>
          ))}
        </div>

        {/* Arrow transition */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-px h-10" style={{ background: C.khaki }} />
          <div
            className="px-8 py-4 rounded-full text-lg font-black"
            style={{ background: C.green, color: C.cream, fontFamily: "var(--font-display)" }}
          >
            Beancountr fixes all three.
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Clock,
      title: "Log time & expenses",
      body: "Add time entries as you work. Log expenses as they come in. Takes seconds, not minutes.",
    },
    {
      step: "02",
      icon: FileText,
      title: "Send professional invoices",
      body: "Turn logged time into invoices instantly. Export as PDF and send to clients in one click.",
    },
    {
      step: "03",
      icon: PoundSterling,
      title: "See what's yours to spend",
      body: "The dashboard shows income, tax reserve, pension pot and safe-to-spend — always up to date.",
    },
  ];

  return (
    <section className="py-20 px-6" style={{ background: C.khaki }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl font-black"
            style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
          >
            Three steps to financial clarity
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-10">
          {steps.map((item) => (
            <div key={item.step} className="flex flex-col">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: C.green }}
              >
                <item.icon className="w-5 h-5" style={{ color: C.cream }} />
              </div>
              <span
                className="text-xs font-black tracking-widest mb-2"
                style={{ color: C.amber }}
              >
                {item.step}
              </span>
              <h3
                className="font-bold text-lg mb-2"
                style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: TrendingUp, title: "Income & profit dashboard", sub: "See where you stand at a glance" },
    { icon: Clock, title: "Time tracking", sub: "Log hours by client and project" },
    { icon: FileText, title: "Invoice generation", sub: "Professional PDF invoices" },
    { icon: PoundSterling, title: "Tax reserve planning", sub: "Automatic estimates, UK-focused" },
    { icon: Shield, title: "Pension set-aside", sub: "Pay your future self first" },
    { icon: CheckCircle, title: "Expense tracking", sub: "Categories, deductibility, totals" },
  ];

  return (
    <section className="py-20 px-6" style={{ background: C.cream }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-black"
            style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
          >
            Everything you need, nothing you don&apos;t
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 flex items-start gap-4"
              style={{
                background: C.cardBg,
                border: `1px solid ${C.khaki}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: C.lightGreen }}
              >
                <item.icon className="w-5 h-5" style={{ color: C.green }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: C.charcoal }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const freeItems = [
    { ok: true, text: "3 clients max" },
    { ok: true, text: "5 invoices/month" },
    { ok: true, text: "Dashboard with tax + pension estimates" },
    { ok: true, text: "Time & expense tracking" },
    { ok: false, text: "Beancountr branding on invoices" },
  ];
  const proItems = [
    { text: "Unlimited clients & invoices" },
    { text: "No branding on invoices" },
    { text: "PDF invoices with custom styling" },
    { text: "Payment reminders" },
    { text: "CSV exports" },
  ];

  return (
    <section className="py-20 px-6" style={{ background: C.lightGreen }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-black"
            style={{ fontFamily: "var(--font-display)", color: C.charcoal }}
          >
            Simple, honest pricing
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start justify-center">
          {/* Free card */}
          <div
            className="flex-1 rounded-3xl p-8"
            style={{
              background: C.white,
              border: `1.5px solid ${C.khaki}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.muted }}>Free</p>
            <p className="text-4xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: C.charcoal }}>
              £0
            </p>
            <p className="text-sm mb-6" style={{ color: C.muted }}>Free forever</p>

            <ul className="space-y-3 mb-8">
              {freeItems.map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-sm">
                  {item.ok ? (
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
                  ) : (
                    <X className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
                  )}
                  <span style={{ color: item.ok ? C.charcoal : C.muted }}>{item.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full text-center font-bold py-3 rounded-full border-2 transition-all hover:opacity-80"
              style={{ borderColor: C.green, color: C.green }}
            >
              Start free
            </Link>
          </div>

          {/* Pro card */}
          <div
            className="flex-1 rounded-3xl p-8 md:scale-105"
            style={{
              background: C.charcoal,
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            }}
          >
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#8BAF9E" }}>Pro</p>
            <p className="text-4xl font-black mb-1" style={{ fontFamily: "var(--font-display)", color: C.cream }}>
              £12
              <span className="text-lg font-semibold ml-1" style={{ color: "#8BAF9E" }}>/month</span>
            </p>
            <p className="text-sm mb-1" style={{ color: "#8BAF9E" }}>or £90/year</p>
            <div
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full mb-6"
              style={{ background: C.green }}
            >
              <span className="text-xs font-bold" style={{ color: C.cream }}>Save 37%</span>
            </div>

            <p className="text-xs font-semibold mb-3" style={{ color: "#8BAF9E" }}>Everything in Free, plus:</p>
            <ul className="space-y-3 mb-8">
              {proItems.map((item) => (
                <li key={item.text} className="flex items-center gap-2.5 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.green }} />
                  <span style={{ color: C.cream }}>{item.text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block w-full text-center font-bold py-3 rounded-full transition-all hover:opacity-90"
              style={{ background: C.green, color: C.cream }}
            >
              Get Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-24 px-6" style={{ background: C.charcoal }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2
          className="text-4xl font-black mb-3"
          style={{ fontFamily: "var(--font-display)", color: C.cream }}
        >
          Ready to know what&apos;s yours?
        </h2>
        <p className="text-lg mb-8" style={{ color: "#8C8278" }}>
          Stop guessing. Start knowing.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 font-bold px-9 py-4 rounded-full text-base transition-all hover:opacity-90 hover:shadow-2xl"
          style={{ background: C.green, color: C.cream }}
        >
          Start tracking free <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm mt-5" style={{ color: "#6B6458" }}>
          No credit card required · Free forever for 1 client
        </p>
      </div>
    </section>
  );
}

function Footer() {
  const links = ["Pricing", "Blog", "How-to", "Help", "Privacy"];

  return (
    <footer className="py-8 px-6" style={{ background: C.charcoal, borderTop: `1px solid #2E2E2E` }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/">
          <img
            src="/WordmarkAlt.png"
            alt="Beancountr"
            style={{ height: "50px", objectFit: "contain" }}
          />
        </Link>

        <div className="flex items-center gap-5 flex-wrap justify-center">
          {links.map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase().replace("-", "-")}`}
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: "#6B6458" }}
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-sm text-center sm:text-right" style={{ color: "#6B6458" }}>
          &copy; 2026 Beancountr · Built for UK freelancers
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: C.cream }}>
      <Nav />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <Pricing />
      <CtaBanner />
      <Footer />
    </div>
  );
}
