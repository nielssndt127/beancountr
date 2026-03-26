import Link from "next/link";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: CHARCOAL }}>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
          </Link>
          <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-lg" style={{ background: CREAM, color: CHARCOAL }}>
            Sign up free
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: MUTED }}>Last updated: 26 March 2026</p>

        <div className="prose max-w-none space-y-8 text-sm leading-relaxed" style={{ color: MUTED }}>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>1. Who we are</h2>
            <p>Beancountr (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates beancountr.com and beancountr.co.uk. We provide financial management software for UK freelancers and small businesses. For GDPR purposes, we are the data controller.</p>
            <p className="mt-2">Contact: <a href="mailto:hello@beancountr.com" className="underline" style={{ color: CREAM }}>hello@beancountr.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>2. What data we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong style={{ color: CREAM }}>Account data:</strong> email address, name (when you sign up)</li>
              <li><strong style={{ color: CREAM }}>Business data:</strong> client names, invoice details, time entries, expenses — data you enter into the app</li>
              <li><strong style={{ color: CREAM }}>Settings data:</strong> business name, tax rates, pension rates, invoice defaults</li>
              <li><strong style={{ color: CREAM }}>Payment data:</strong> handled entirely by Stripe — we never see or store card details</li>
              <li><strong style={{ color: CREAM }}>Usage data:</strong> pages visited, features used, error logs (to improve the service)</li>
              <li><strong style={{ color: CREAM }}>Cookie data:</strong> session cookies for authentication; analytics cookies only with your consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and maintain your Beancountr account</li>
              <li>To process payments via Stripe</li>
              <li>To send transactional emails (invoices, receipts, password resets)</li>
              <li>To improve the product based on aggregate usage patterns</li>
              <li>To comply with legal obligations (e.g. VAT, HMRC reporting requirements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>4. Legal basis (GDPR)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong style={{ color: CREAM }}>Contract:</strong> processing needed to deliver the service you signed up for</li>
              <li><strong style={{ color: CREAM }}>Legitimate interests:</strong> fraud prevention, security, product improvement</li>
              <li><strong style={{ color: CREAM }}>Consent:</strong> analytics cookies (you can withdraw at any time)</li>
              <li><strong style={{ color: CREAM }}>Legal obligation:</strong> compliance with UK law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>5. Data sharing</h2>
            <p>We do not sell your data. We share data only with trusted processors:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong style={{ color: CREAM }}>Supabase</strong> — database and authentication (EU data centres)</li>
              <li><strong style={{ color: CREAM }}>Stripe</strong> — payment processing</li>
              <li><strong style={{ color: CREAM }}>Vercel</strong> — hosting (EU region)</li>
              <li><strong style={{ color: CREAM }}>Resend</strong> — transactional email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>6. Data retention</h2>
            <p>We keep your data for as long as your account is active. If you delete your account, we delete your personal data within 30 days, except where we are required to retain it by law (e.g. financial records for 6 years under UK law).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>7. Your rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
              <li>Object to or restrict processing</li>
              <li>Data portability (export your data)</li>
              <li>Withdraw consent (for cookies) at any time</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email <a href="mailto:hello@beancountr.com" className="underline" style={{ color: CREAM }}>hello@beancountr.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>8. Cookies</h2>
            <p>We use:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong style={{ color: CREAM }}>Essential cookies:</strong> required for authentication and security. Cannot be disabled.</li>
              <li><strong style={{ color: CREAM }}>Analytics cookies:</strong> used only with your consent to understand how the product is used.</li>
            </ul>
            <p className="mt-2">You can change your cookie preferences at any time using the cookie banner.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>9. Security</h2>
            <p>All data is encrypted in transit (TLS) and at rest. We use Supabase Row Level Security to ensure users can only access their own data. Authentication is handled via secure OAuth/magic link flows.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>10. Changes to this policy</h2>
            <p>We may update this policy from time to time. We will notify you by email of any material changes. Continued use of the service constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: CREAM }}>11. Complaints</h2>
            <p>If you are unhappy with how we handle your data, you have the right to complain to the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" className="underline" style={{ color: CREAM }} target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
