"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/server/actions/settings";
import { deleteAccount } from "@/server/actions/account";
import { BusinessType } from "@prisma/client";

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

const CREAM = "oklch(0.97 0.015 80)";
const CHARCOAL = "oklch(0.16 0.008 80)"; // dark text
const CARD = "oklch(0.97 0.015 80)";
const BORDER = "oklch(0.88 0.015 80)";
const MUTED = "oklch(0.45 0.01 80)";
const inputStyle = { background: CARD, border: `1px solid ${BORDER}`, color: CREAM, "--tw-ring-color": CREAM } as React.CSSProperties;
const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const ringStyle = { "--tw-ring-color": "oklch(0.94 0.025 80)" } as React.CSSProperties;

export function SettingsClient({ user }: { user: User }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Manage your business details and default rates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Your Business */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="font-semibold" style={{ color: CREAM }}>Your Business</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Full name</label>
            <input name="fullName" defaultValue={user.fullName ?? ""} placeholder="Alex Smith" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Business name</label>
            <input name="businessName" defaultValue={user.businessName ?? ""} placeholder="Smith Digital Ltd" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Business type</label>
            <select name="businessType" defaultValue={user.businessType} className={inputClass} style={inputStyle}>
              <option value="SOLE_TRADER">Sole trader</option>
              <option value="LIMITED_COMPANY">Limited company</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Business address</label>
            <textarea name="address" defaultValue={user.address ?? ""} rows={3} placeholder="123 Example Street&#10;London&#10;EC1A 1BB" className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Phone</label>
              <input name="phone" defaultValue={user.phone ?? ""} placeholder="+44 7700 900000" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Website</label>
              <input name="website" defaultValue={user.website ?? ""} placeholder="https://example.com" className={inputClass} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            <h2 className="font-semibold" style={{ color: CREAM }}>Payment Details</h2>
            <p className="text-xs text-stone-400 mt-1">These details can be shown on your invoices.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>PayPal email</label>
            <input name="paypalEmail" type="email" defaultValue={user.paypalEmail ?? ""} placeholder="paypal@example.com" className={inputClass} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Bank name</label>
              <input name="bankName" defaultValue={user.bankName ?? ""} placeholder="Monzo" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Account name</label>
              <input name="bankAccountName" defaultValue={user.bankAccountName ?? ""} placeholder="Alex Smith" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Sort code</label>
              <input name="bankSortCode" defaultValue={user.bankSortCode ?? ""} placeholder="04-00-04" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Account number</label>
              <input name="bankAccountNo" defaultValue={user.bankAccountNo ?? ""} placeholder="12345678" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>IBAN</label>
            <input name="bankIban" defaultValue={user.bankIban ?? ""} placeholder="GB29 NWBK 6016 1331 9268 19" className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Tax & Pension */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            <h2 className="font-semibold" style={{ color: CREAM }}>Tax & pension reserves</h2>
            <p className="text-xs text-stone-400 mt-1">Planning estimates only — not formal tax advice.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Tax reserve %</label>
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
              <p className="text-xs text-stone-400 mt-1">Sole trader: 25–30% · Ltd: 20–25%</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Pension reserve %</label>
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
              <p className="text-xs text-stone-400 mt-1">Default: 10%</p>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <h2 className="font-semibold" style={{ color: CREAM }}>Invoice defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Invoice prefix</label>
              <input name="invoicePrefix" defaultValue={user.invoicePrefix} placeholder="INV" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Payment terms (days)</label>
              <input name="paymentTerms" type="number" min="1" defaultValue={user.paymentTerms} className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: CREAM }}>Default invoice notes</label>
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
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: CREAM, color: CHARCOAL }}
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && <p className="text-sm text-emerald-600 font-medium">Saved!</p>}
        </div>
      </form>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-red-700">Danger zone</h2>
          <p className="text-xs text-stone-400 mt-1">
            Irreversible actions. Please read carefully before proceeding.
          </p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-stone-700">Delete account</p>
            <p className="text-xs text-stone-400 mt-0.5 max-w-sm">
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
          <div className="bg-white rounded-2xl w-full max-w-md p-7">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete your account?</h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
              This will permanently delete all your data including clients, invoices, time entries
              and expenses. <strong className="text-stone-700">This cannot be undone.</strong>
            </p>
            <p className="text-sm text-stone-600 mb-2">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent bg-white mb-4"
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
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
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
