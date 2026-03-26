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

const ORANGE = "oklch(0.72 0.22 48)";
const ORANGE_LIGHT = "oklch(0.96 0.07 48)";
const YELLOW = "oklch(0.88 0.18 88)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";
const TEAL = "oklch(0.55 0.22 195)";
const TEAL_LIGHT = "oklch(0.94 0.07 195)";
const PURPLE = "oklch(0.52 0.18 290)";
const PURPLE_LIGHT = "oklch(0.95 0.06 290)";

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
    bg: TEAL_LIGHT,
    color: TEAL,
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Logging time entries, setting rates, attributing hours to clients and projects, and converting to invoices.",
    href: "/how-to#04",
    bg: ORANGE_LIGHT,
    color: ORANGE,
  },
  {
    icon: Receipt,
    title: "Expenses",
    description:
      "Adding expenses, choosing categories, marking deductibility, and how expenses affect your tax estimate.",
    href: "/how-to#05",
    bg: YELLOW_LIGHT,
    color: "oklch(0.50 0.14 75)",
  },
  {
    icon: PoundSterling,
    title: "Tax Estimate",
    description:
      "How the tax estimate is calculated, setting your reserve rate, and understanding the dashboard figures.",
    href: "/how-to#08",
    bg: PURPLE_LIGHT,
    color: PURPLE,
  },
  {
    icon: Settings,
    title: "Settings",
    description:
      "Business details, invoice defaults, tax and pension rates, billing, and account management.",
    href: "/how-to#02",
    bg: TEAL_LIGHT,
    color: TEAL,
  },
  {
    icon: BarChart2,
    title: "Dashboard",
    description:
      "Understanding the dashboard metrics, income trends, outstanding invoices, and the safe-to-spend figure.",
    href: "/how-to#07",
    bg: ORANGE_LIGHT,
    color: ORANGE,
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/Wordmark.png"
              alt="Beancountr"
              style={{ width: "220px", height: "67px", objectFit: "contain" }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Blog
            </Link>
            <Link href="/help" className="text-sm text-stone-900 font-semibold transition-colors">
              Help
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
      <section className="pt-28 pb-14 px-6" style={{ background: YELLOW_LIGHT }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            style={{ background: "white", color: ORANGE }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Help &amp; Documentation
          </div>
          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            How can we <span style={{ color: PURPLE }}>help you?</span>
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed">
            Find answers to common questions, documentation for every feature, and ways to get in
            touch with our support team.
          </p>
        </div>
      </section>

      {/* Documentation cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Documentation</h2>
          <p className="text-stone-400 text-sm mb-8">
            Step-by-step guides for every part of Beancountr.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOCS.map((doc) => (
              <Link
                key={doc.title}
                href={doc.href}
                className="group bg-white rounded-2xl card-shadow card-shadow-hover p-6 flex items-start gap-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: doc.bg }}
                >
                  <doc.icon className="w-5 h-5" style={{ color: doc.color }} />
                </div>
                <div>
                  <p className="font-bold text-stone-800 mb-1 group-hover:text-stone-600 transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-sm text-stone-400 leading-relaxed">{doc.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-6" style={{ background: TEAL_LIGHT }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Frequently asked questions</h2>
          <p className="text-stone-400 text-sm mb-8">
            Common questions from Beancountr users. Can&apos;t find what you&apos;re looking for? Get in
            touch below.
          </p>
          <FaqAccordion />
        </div>
      </section>

      {/* Contact support */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Still need help?</h2>
          <p className="text-stone-400 text-sm mb-8">
            Our support team is on hand to help with any questions not covered above.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-2xl card-shadow p-6" style={{ background: ORANGE_LIGHT }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: ORANGE }}
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">Email support</h3>
              <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                Send us an email and we&apos;ll get back to you within one business day. Pro users
                receive priority responses.
              </p>
              <a
                href="mailto:help@beancountr.co.uk"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:opacity-80"
                style={{ color: ORANGE }}
              >
                help@beancountr.co.uk <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="rounded-2xl card-shadow p-6" style={{ background: YELLOW_LIGHT }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "oklch(0.72 0.18 88)" }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-stone-800 mb-2">Step-by-step guide</h3>
              <p className="text-sm text-stone-500 mb-4 leading-relaxed">
                Our comprehensive how-to guide walks through every feature with tips and best
                practices for UK freelancers.
              </p>
              <Link
                href="/how-to"
                className="inline-flex items-center gap-1.5 text-sm font-bold transition-all hover:opacity-80"
                style={{ color: "oklch(0.50 0.14 75)" }}
              >
                Read the guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
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
