import Link from "next/link";
import {
  FileText,
  Clock,
  Receipt,
  PoundSterling,
  Settings,
  BarChart2,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import type { Metadata } from "next";
import { FaqAccordion } from "./faq-accordion";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CHARCOAL_MID = "oklch(0.20 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export const metadata: Metadata = {
  title: "Help & Documentation | Beancountr",
  description:
    "Help centre for Beancountr. Find answers to common questions, documentation for every feature, and ways to get in touch with support.",
};

const DOCS = [
  {
    icon: FileText,
    title: "Invoices",
    description:
      "Creating invoices, adding line items, importing time entries, PDF export, and managing invoice status.",
    href: "/how-to#06",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Logging time entries, setting rates, attributing hours to clients and projects, and converting to invoices.",
    href: "/how-to#04",
  },
  {
    icon: Receipt,
    title: "Expenses",
    description:
      "Adding expenses, choosing categories, marking deductibility, and how expenses affect your tax estimate.",
    href: "/how-to#05",
  },
  {
    icon: PoundSterling,
    title: "Tax Estimate",
    description:
      "How the tax estimate is calculated, setting your reserve rate, and understanding the dashboard figures.",
    href: "/how-to#08",
  },
  {
    icon: Settings,
    title: "Settings",
    description:
      "Business details, invoice defaults, tax and pension rates, billing, and account management.",
    href: "/how-to#02",
  },
  {
    icon: BarChart2,
    title: "Dashboard",
    description:
      "Understanding the dashboard metrics, income trends, outstanding invoices, and the safe-to-spend figure.",
    href: "/how-to#07",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen" style={{ background: CHARCOAL }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/Wordmark.png"
              alt="Beancountr"
              style={{ width: "220px", height: "68px", objectFit: "contain" }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: MUTED }}>
              Pricing
            </Link>
            <Link href="/blog" className="text-sm transition-colors" style={{ color: MUTED }}>
              Blog
            </Link>
            <Link href="/help" className="text-sm font-semibold transition-colors" style={{ color: CREAM }}>
              Help
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: MUTED }}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: CREAM, color: CHARCOAL }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-14 px-6" style={{ background: CHARCOAL_MID }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            style={{ background: CARD, color: CREAM, border: `1px solid ${BORDER}` }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Help &amp; Documentation
          </div>
          <h1 className="text-4xl mb-4" style={{ fontFamily: "var(--font-display)", color: CREAM }}>
            How can we <span style={{ color: MUTED }}>help you?</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: MUTED }}>
            Find answers to common questions, documentation for every feature, and ways to get in
            touch with our support team.
          </p>
        </div>
      </section>

      {/* Documentation cards */}
      <section className="py-16 px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Documentation</h2>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            Step-by-step guides for every part of Beancountr.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOCS.map((doc) => (
              <Link
                key={doc.title}
                href={doc.href}
                className="group rounded-2xl card-shadow card-shadow-hover p-6 flex items-start gap-4"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: BORDER }}
                >
                  <doc.icon className="w-5 h-5" style={{ color: CREAM }} />
                </div>
                <div>
                  <p className="font-bold mb-1 transition-colors" style={{ color: CREAM }}>
                    {doc.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{doc.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-6" style={{ background: CHARCOAL_MID }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Frequently asked questions</h2>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            Common questions from Beancountr users. Can&apos;t find what you&apos;re looking for? Get in
            touch below.
          </p>
          <FaqAccordion />
        </div>
      </section>

      {/* Contact support */}
      <section className="py-16 px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Still need help?</h2>
          <p className="text-sm mb-8" style={{ color: MUTED }}>
            Our support team is on hand to help with any questions not covered above.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl card-shadow p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: BORDER }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: CREAM }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: CREAM }}>Email support</h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: MUTED }}>
                Send us an email and we&apos;ll get back to you within one business day. Pro users
                receive priority responses.
              </p>
              <a
                href="mailto:help@beancountr.co.uk"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:opacity-80"
                style={{ color: CREAM }}
              >
                help@beancountr.co.uk <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="rounded-2xl card-shadow p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: BORDER }}
              >
                <BookOpen className="w-5 h-5" style={{ color: CREAM }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: CREAM }}>Step-by-step guide</h3>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: MUTED }}>
                Our comprehensive how-to guide walks through every feature with tips and best
                practices for UK freelancers.
              </p>
              <Link
                href="/how-to"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:opacity-80"
                style={{ color: CREAM }}
              >
                Read the guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
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
            <Link href="/blog" className="text-sm transition-colors" style={{ color: MUTED }}>Blog</Link>
            <Link href="/privacy" className="text-sm transition-colors" style={{ color: MUTED }}>Privacy</Link>
            <Link href="/login" className="text-sm transition-colors" style={{ color: MUTED }}>Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
