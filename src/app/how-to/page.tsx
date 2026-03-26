import Link from "next/link";
import {
  UserCircle,
  Settings,
  Users,
  Clock,
  Receipt,
  FileText,
  BarChart2,
  PoundSterling,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import type { Metadata } from "next";

const ORANGE = "oklch(0.72 0.22 48)";
const ORANGE_LIGHT = "oklch(0.96 0.07 48)";
const YELLOW = "oklch(0.88 0.18 88)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";
const TEAL = "oklch(0.55 0.22 195)";
const TEAL_LIGHT = "oklch(0.94 0.07 195)";
const PURPLE = "oklch(0.52 0.18 290)";
const PURPLE_LIGHT = "oklch(0.95 0.06 290)";

export const metadata: Metadata = {
  title: "How to Use Beancountr | Step-by-Step Guide",
  description:
    "A step-by-step guide to getting started with Beancountr. Set up your account, track time and expenses, send invoices, and understand your tax estimate.",
};

const STEPS = [
  {
    number: "01",
    icon: UserCircle,
    title: "Create your account",
    description:
      "Sign up with your email address at beancountr.co.uk/signup. No credit card required — the free plan covers up to 3 clients with unlimited time and expense tracking. Your account is ready to use immediately after email verification.",
    tips: [
      "Use a dedicated email address for your business if you have one",
      "The free plan is genuinely free forever — no trial period",
      "You can upgrade to Pro at any time without losing data",
    ],
    color: ORANGE,
    bg: ORANGE_LIGHT,
  },
  {
    number: "02",
    icon: Settings,
    title: "Set up your profile & tax rates",
    description:
      "Head to Settings to enter your business details and configure your default tax reserve and pension rates. Beancountr uses these to calculate how much of each payment to set aside. The defaults (25% tax, 10% pension) are sensible starting points for most UK sole traders.",
    tips: [
      "Sole traders earning under £50,000: 25% tax reserve is usually sufficient",
      "Higher earners: increase the tax reserve to 30–35%",
      "Your pension rate is separate — consider at least 5% as a minimum",
    ],
    color: TEAL,
    bg: TEAL_LIGHT,
  },
  {
    number: "03",
    icon: Users,
    title: "Add your clients",
    description:
      "Go to Clients and add each of your clients with their name, email, and address. Client details are used on invoices and to organise your time entries and reports. You can edit client information at any time.",
    tips: [
      "Add clients before logging time so entries are correctly attributed",
      "Include the client's billing address — you'll need it on invoices",
      "Free accounts support up to 3 clients; upgrade for unlimited",
    ],
    color: PURPLE,
    bg: PURPLE_LIGHT,
  },
  {
    number: "04",
    icon: Clock,
    title: "Log your time",
    description:
      "Go to Time Tracking to add time entries. Select a client, enter the date, hours worked, your hourly rate, and a description. Beancountr calculates the value of each entry and tracks your unbilled hours per client so you always know what's due to be invoiced.",
    tips: [
      "Log time daily rather than reconstructing it at week-end",
      "Add a specific description — it appears on your invoice line items",
      "You can log time in decimal hours (e.g., 1.5 hours for 90 minutes)",
    ],
    color: ORANGE,
    bg: ORANGE_LIGHT,
  },
  {
    number: "05",
    icon: Receipt,
    title: "Track expenses",
    description:
      "Add business expenses as they occur under Expenses. Enter the date, category, description, and amount, and mark whether the expense is tax-deductible. These expenses reduce your taxable profit and feed into your tax estimate on the dashboard.",
    tips: [
      "Photograph receipts immediately — you'll thank yourself at year end",
      "Mark expenses as deductible only if they're wholly for business use",
      "Common categories: software, equipment, travel, professional fees",
    ],
    color: TEAL,
    bg: TEAL_LIGHT,
  },
  {
    number: "06",
    icon: FileText,
    title: "Create and send invoices",
    description:
      "Go to Invoices and create a new invoice. Select a client, add a due date, and either add line items manually or import logged time entries. Beancountr generates a professional PDF invoice with your business details. Download it and send to your client, or copy the link to share directly.",
    tips: [
      "Invoice on the day you complete work — don't wait until end of month",
      "Use Import Time Entries to convert logged hours into invoice lines instantly",
      "Include your bank details on every invoice so payment is frictionless",
    ],
    color: PURPLE,
    bg: PURPLE_LIGHT,
  },
  {
    number: "07",
    icon: BarChart2,
    title: "Review your dashboard",
    description:
      "The dashboard shows your financial position at a glance: total income, outstanding invoices, expenses, and your safe-to-spend figure. It updates in real time as you log entries and mark invoices paid. Check it weekly to stay on top of your finances without any manual calculation.",
    tips: [
      "Mark invoices as Paid when payment arrives to keep your figures accurate",
      "The income chart shows revenue trends across the year",
      "Outstanding invoices are highlighted so you can chase promptly",
    ],
    color: ORANGE,
    bg: ORANGE_LIGHT,
  },
  {
    number: "08",
    icon: PoundSterling,
    title: "Understand your tax estimate",
    description:
      "The tax estimate on your dashboard shows the amount you should have set aside based on your income, expenses, and the tax reserve rate you configured. This is a planning estimate — not formal tax advice — but it gives you a reliable guide to how much belongs to HMRC and how much is genuinely yours to spend or save.",
    tips: [
      "The estimate accounts for your Personal Allowance automatically",
      "Always consult an accountant before submitting your Self Assessment",
      "The pension set-aside is shown separately from the tax reserve",
    ],
    color: TEAL,
    bg: TEAL_LIGHT,
  },
];

export default function HowToPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/Wordmark.png"
              alt="Beancountr"
              style={{ width: "300px", height: "92px", objectFit: "contain" }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Blog
            </Link>
            <Link href="/how-to" className="text-sm text-stone-900 font-semibold transition-colors">
              How it works
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-700 font-medium hover:text-stone-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: ORANGE }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-6" style={{ background: YELLOW_LIGHT }}>
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: ORANGE }}
          >
            Step-by-step guide
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-5">
            How to use <span style={{ color: PURPLE }}>Beancountr</span>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed max-w-2xl mx-auto">
            From signing up to understanding your tax estimate — here's everything you need to get
            Beancountr working for your freelance finances.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-bold text-white px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: ORANGE }}
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/help" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
              Read the FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10">
            {STEPS.map((step, idx) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl card-shadow overflow-hidden flex flex-col md:flex-row"
              >
                {/* Step number + icon */}
                <div
                  className="md:w-24 flex flex-row md:flex-col items-center justify-center gap-3 p-6 shrink-0"
                  style={{ background: step.bg }}
                >
                  <span className="text-2xl font-bold" style={{ color: step.color }}>
                    {step.number}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: step.color }}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <h2 className="text-lg font-bold text-stone-900 mb-3">{step.title}</h2>
                  <p className="text-stone-500 text-sm leading-relaxed mb-5">{step.description}</p>
                  <div className="space-y-2">
                    {step.tips.map((tip) => (
                      <div key={tip} className="flex items-start gap-2.5">
                        <CheckCircle
                          className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: step.color }}
                        />
                        <p className="text-sm text-stone-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: ORANGE }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your finances?</h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Join thousands of UK freelancers who use Beancountr to know exactly where they stand financially — every month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg text-stone-900"
              style={{ background: YELLOW }}
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/help"
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
              Browse the help centre →
            </Link>
          </div>
          <p className="text-white/50 text-sm mt-5">No credit card required · Free forever for up to 3 clients</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <img
              src="/WordmarkAlt.png"
              alt="Beancountr"
              style={{ width: "160px", height: "80px", objectFit: "contain" }}
            />
          </Link>
          <p className="text-sm text-stone-400">Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Pricing</Link>
            <Link href="/blog" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Blog</Link>
            <Link href="/privacy" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Privacy</Link>
            <Link href="/login" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
