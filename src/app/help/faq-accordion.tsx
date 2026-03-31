"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const CREAM = "oklch(0.94 0.025 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

const FAQS = [
  {
    q: "How do I connect my bank account?",
    a: "Beancountr doesn't currently require bank connection. You log income by raising invoices and marking them paid, and log expenses manually or from receipts. This keeps your data under your control and avoids sharing banking credentials. Bank import is on the product roadmap.",
  },
  {
    q: "How is my tax estimate calculated?",
    a: "Your tax estimate is based on your net profit (income minus allowable expenses), your Personal Allowance (£12,570 for 2026/27), and the Income Tax and Class 4 National Insurance rates for your income band. The estimate uses the tax reserve percentage you set in Settings. It's a planning estimate rather than a formal tax calculation, so always confirm your actual bill with an accountant or HMRC.",
  },
  {
    q: "Can I use Beancountr for a limited company?",
    a: "Beancountr is primarily designed for sole traders. Limited company users can track income, expenses, time, and invoices, and the dashboard is useful for monitoring cash flow. However, the tax estimate is based on Income Tax and NI rates applicable to sole traders, not Corporation Tax. If you're a limited company director, use the tax estimate as a rough guide only.",
  },
  {
    q: "How do I mark an invoice as paid?",
    a: "Go to Invoices, find the invoice in question, and click the status badge or use the Mark as Paid option. This updates the invoice status to Paid and moves it to your paid income figures on the dashboard. If a client pays partially, you can update the invoice manually and keep a note in the invoice notes field.",
  },
  {
    q: "What is the pension set-aside and how is it calculated?",
    a: "The pension set-aside is a portion of your income ring-fenced for retirement savings, shown separately from your tax reserve on the dashboard. You set your pension rate (as a percentage) in Settings. The default is 10%. The pension set-aside is informational: Beancountr doesn't transfer money to a pension for you. Use it as a guide for your monthly pension contributions.",
  },
  {
    q: "Can I export my data?",
    a: "Pro users can export income, expense, and invoice data as CSV files suitable for your accountant. Go to Settings and look for the Export section. Free users can view all their data within the app. If you cancel your subscription, you can export before downgrading.",
  },
  {
    q: "How do I add VAT to invoices?",
    a: "If you're VAT registered, you can add a VAT line to invoices manually. Enter your line items at the net rate, then add a VAT line item showing the VAT amount (20% of the net total, or a different rate if applicable). Beancountr's invoice template shows net, VAT, and gross totals clearly. Automatic VAT calculation is on the product roadmap.",
  },
  {
    q: "Can I customise my invoice branding?",
    a: "Pro users can remove Beancountr branding from invoices. Your business name, as entered in Settings, appears on all invoices. Full logo upload and custom colour options are on the roadmap. Free plan invoices display a small 'Created with Beancountr' note.",
  },
  {
    q: "How do I delete a client?",
    a: "Go to Clients, open the client record, and choose Delete. Note that deleting a client does not delete the invoices, time entries, or expenses associated with that client. They remain in your records. If you want to archive a client without deleting their history, simply stop adding new entries against them.",
  },
  {
    q: "What happens to my data if I cancel my Pro subscription?",
    a: "Your data is never deleted when you downgrade from Pro to Free. You'll retain access to all your historical records. However, features limited to Pro (unlimited clients, unlimited invoices, CSV export) will become restricted. If you have more than 3 clients when you downgrade, existing data is preserved but you won't be able to add new clients until you're within the free plan limits.",
  },
  {
    q: "Can I collaborate with my accountant?",
    a: "The CSV export feature (Pro) is designed for sharing data with accountants. You can export income and expense summaries in a format most accounting software can import. We're building a dedicated accountant sharing mode. Watch the roadmap for updates.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Beancountr uses Supabase for authentication and a PostgreSQL database with row-level security. Data is encrypted in transit (TLS) and at rest. We do not sell your data or share it with third parties. See our Privacy Policy for full details.",
  },
  {
    q: "How do I change my email or password?",
    a: "Log in, go to Settings, and look for the Account section. Email changes trigger a verification step. To change your password, use the 'Forgot password' link on the login page, which sends a reset email. For security reasons, password changes always require re-verification.",
  },
  {
    q: "What payment methods do you accept for Pro?",
    a: "We use Stripe for Pro subscriptions and accept all major credit and debit cards (Visa, Mastercard, American Express). You can also pay annually (monthly card on file is required for the monthly plan). We don't accept PayPal or bank transfers for subscriptions.",
  },
  {
    q: "How do I cancel my Pro subscription?",
    a: "Go to Settings and find the Billing section. You can cancel your Pro subscription at any time and you'll retain Pro access until the end of your current billing period, then revert to the Free plan. No partial refunds are available for unused months.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, idx) => (
        <div key={idx} className="rounded-2xl card-shadow overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span className="font-semibold text-sm pr-4" style={{ color: CREAM }}>{faq.q}</span>
            <ChevronDown
              className="w-4 h-4 shrink-0 transition-transform duration-200"
              style={{ color: MUTED, transform: open === idx ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {open === idx && (
            <div className="px-6 pb-5">
              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
