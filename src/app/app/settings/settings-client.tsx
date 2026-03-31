"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/server/actions/settings";
import { deleteAccount } from "@/server/actions/account";
import { BusinessType } from "@prisma/client";

const MONTHLY_PRICE_ID = "price_1TFAJPCYYPLMwF3Gz0mHY8dM";
const ANNUAL_PRICE_ID  = "price_1TFAKYCYYPLMwF3Gy2STKc5i";

type User = {
  fullName: string | null;
  businessName: string | null;
  businessType: BusinessType;
  address: string | null;
  phone: string | null;
  website: string | null;
  taxReserveRate: number;
  pensionRate: number;
  invoicePrefix: string;
  paymentTerms: number;
  invoiceNotes: string | null;
  paypalEmail: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankSortCode: string | null;
  bankAccountNo: string | null;
  bankIban: string | null;
};

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL, "--tw-ring-color": GREEN } as React.CSSProperties;
const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";

export function SettingsClient({ user, plan, stripeSubscriptionId }: {
  user: User;
  plan: "FREE" | "PRO";
  stripeSubscriptionId: string | null;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  async function handleUpgrade(priceId: string) {
    setUpgrading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(null);
    }
  }

  // Danger Zone state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      router.push("/");
    } catch {
      setDeleteError("Something went wrong. Please try again or contact support.");
      setDeleting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    await updateSettings(new FormData(e.currentTarget));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Manage your business details and default rates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Your Business */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="font-semibold" style={{ color: CHARCOAL }}>Your Business</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Full name</label>
            <input name="fullName" defaultValue={user.fullName ?? ""} placeholder="Alex Smith" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Business name</label>
            <input name="businessName" defaultValue={user.businessName ?? ""} placeholder="Smith Digital Ltd" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Business type</label>
            <select name="businessType" defaultValue={user.businessType} className={inputClass} style={inputStyle}>
              <option value="SOLE_TRADER">Sole trader</option>
              <option value="LIMITED_COMPANY">Limited company</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Business address</label>
            <textarea name="address" defaultValue={user.address ?? ""} rows={3} placeholder="123 Example Street&#10;London&#10;EC1A 1BB" className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Phone</label>
              <input name="phone" defaultValue={user.phone ?? ""} placeholder="+44 7700 900000" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Website</label>
              <input name="website" defaultValue={user.website ?? ""} placeholder="https://example.com" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            <h2 className="font-semibold" style={{ color: CHARCOAL }}>Payment Details</h2>
            <p className="text-xs mt-1" style={{ color: MUTED }}>These details can be shown on your invoices.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>PayPal email</label>
            <input name="paypalEmail" type="email" defaultValue={user.paypalEmail ?? ""} placeholder="paypal@example.com" className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Bank name</label>
              <input name="bankName" defaultValue={user.bankName ?? ""} placeholder="Monzo" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Account name</label>
              <input name="bankAccountName" defaultValue={user.bankAccountName ?? ""} placeholder="Alex Smith" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Sort code</label>
              <input name="bankSortCode" defaultValue={user.bankSortCode ?? ""} placeholder="04-00-04" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Account number</label>
              <input name="bankAccountNo" defaultValue={user.bankAccountNo ?? ""} placeholder="12345678" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>IBAN</label>
            <input name="bankIban" defaultValue={user.bankIban ?? ""} placeholder="GB29 NWBK 6016 1331 9268 19" className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Tax & Pension */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            <h2 className="font-semibold" style={{ color: CHARCOAL }}>Tax & pension reserves</h2>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Planning estimates only. Not formal tax advice.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Tax reserve %</label>
              <input
                name="taxReserveRate"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={Math.round(user.taxReserveRate * 100)}
                className={inputClass}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: MUTED }}>Sole trader: 25–30% · Ltd: 20–25%</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Pension reserve %</label>
              <input
                name="pensionRate"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={Math.round(user.pensionRate * 100)}
                className={inputClass}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: MUTED }}>Default: 10%</p>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="font-semibold" style={{ color: CHARCOAL }}>Invoice defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Invoice prefix</label>
              <input name="invoicePrefix" defaultValue={user.invoicePrefix} placeholder="INV" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Payment terms (days)</label>
              <input name="paymentTerms" type="number" min="1" defaultValue={user.paymentTerms} className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Default invoice notes</label>
            <textarea
              name="invoiceNotes"
              defaultValue={user.invoiceNotes ?? ""}
              rows={3}
              placeholder="e.g. Please pay within 30 days. Bank details: …"
              className={`${inputClass} resize-none`}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: GREEN, color: "#fff" }}
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && <p className="text-sm font-medium" style={{ color: GREEN }}>Saved!</p>}
        </div>
      </form>

      {/* Plan & Billing */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div>
          <h2 className="font-semibold" style={{ color: CHARCOAL }}>Plan &amp; Billing</h2>
          <p className="text-xs mt-1" style={{ color: MUTED }}>
            You are currently on the <strong style={{ color: CHARCOAL }}>{plan === "PRO" ? "Pro" : "Free"}</strong> plan.
          </p>
        </div>

        {plan === "PRO" ? (
          <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "#E6F2ED", border: "1px solid #C5DDD6" }}>
            <span className="text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: GREEN }}>You&apos;re on Pro</p>
              <p className="text-xs mt-0.5" style={{ color: GREEN }}>
                {stripeSubscriptionId
                  ? "Manage or cancel your subscription via Stripe customer portal."
                  : "Pro access active."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: MUTED }}>
              Upgrade to Pro to unlock unlimited clients, invoice &amp; quote email sending, viewed tracking, custom logo, automated reminders, and CSV exports.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Monthly */}
              <div className="rounded-xl p-4 space-y-3" style={{ border: `1.5px solid ${BORDER}`, background: "#fff" }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Monthly</p>
                  <p className="text-2xl font-black mt-1" style={{ color: CHARCOAL }}>£12<span className="text-sm font-normal" style={{ color: MUTED }}>/mo</span></p>
                </div>
                <button
                  onClick={() => handleUpgrade(MONTHLY_PRICE_ID)}
                  disabled={upgrading !== null}
                  className="w-full py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: GREEN, color: "#fff" }}
                >
                  {upgrading === MONTHLY_PRICE_ID ? "Redirecting…" : "Start 14-day free trial"}
                </button>
              </div>
              {/* Annual */}
              <div className="rounded-xl p-4 space-y-3" style={{ border: `1.5px solid ${GREEN}`, background: "#F0F9F4" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: GREEN }}>Annual</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: GREEN, color: "#fff" }}>Save 37%</span>
                  </div>
                  <p className="text-2xl font-black mt-1" style={{ color: CHARCOAL }}>£90<span className="text-sm font-normal" style={{ color: MUTED }}>/yr</span></p>
                </div>
                <button
                  onClick={() => handleUpgrade(ANNUAL_PRICE_ID)}
                  disabled={upgrading !== null}
                  className="w-full py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: GREEN, color: "#fff" }}
                >
                  {upgrading === ANNUAL_PRICE_ID ? "Redirecting…" : "Start 14-day free trial"}
                </button>
              </div>
            </div>
            <p className="text-xs" style={{ color: MUTED }}>14-day free trial. No charge until the trial ends. Cancel anytime.</p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-red-700">Danger zone</h2>
          <p className="text-xs mt-1" style={{ color: MUTED }}>
            Irreversible actions. Please read carefully before proceeding.
          </p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: CHARCOAL }}>Delete account</p>
            <p className="text-xs mt-0.5 max-w-sm" style={{ color: MUTED }}>
              Permanently deletes your account and all associated data including clients, invoices,
              time entries, and expenses. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl w-full max-w-md p-7" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: CHARCOAL }}>Delete your account?</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
              This will permanently delete all your data including clients, invoices, time entries
              and expenses. <strong style={{ color: CHARCOAL }}>This cannot be undone.</strong>
            </p>
            <p className="text-sm mb-2" style={{ color: CHARCOAL }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent mb-4"
              style={{ border: `1px solid ${BORDER}`, background: "#fff", color: CHARCOAL }}
              autoFocus
            />
            {deleteError && (
              <p className="text-sm text-red-600 mb-3">{deleteError}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                  setDeleteError(null);
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: MUTED }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
