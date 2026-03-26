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
  taxReserveRate: number;
  pensionRate: number;
  invoicePrefix: string;
  paymentTerms: number;
  invoiceNotes: string | null;
};

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white";
const ringStyle = { "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties;

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
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your business details and default rates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business */}
        <div className="bg-white rounded-2xl card-shadow p-6 space-y-4">
          <h2 className="font-semibold text-stone-800">Business details</h2>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Full name</label>
            <input name="fullName" defaultValue={user.fullName ?? ""} placeholder="Alex Smith" className={inputClass} style={ringStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Business name</label>
            <input name="businessName" defaultValue={user.businessName ?? ""} placeholder="Smith Digital Ltd" className={inputClass} style={ringStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Business type</label>
            <select name="businessType" defaultValue={user.businessType} className={inputClass} style={ringStyle}>
              <option value="SOLE_TRADER">Sole trader</option>
              <option value="LIMITED_COMPANY">Limited company</option>
            </select>
          </div>
        </div>

        {/* Tax & Pension */}
        <div className="bg-white rounded-2xl card-shadow p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-stone-800">Tax & pension reserves</h2>
            <p className="text-xs text-stone-400 mt-1">Planning estimates only — not formal tax advice.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tax reserve %</label>
              <input
                name="taxReserveRate"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={Math.round(user.taxReserveRate * 100)}
                className={inputClass}
                style={ringStyle}
              />
              <p className="text-xs text-stone-400 mt-1">Sole trader: 25–30% · Ltd: 20–25%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Pension reserve %</label>
              <input
                name="pensionRate"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={Math.round(user.pensionRate * 100)}
                className={inputClass}
                style={ringStyle}
              />
              <p className="text-xs text-stone-400 mt-1">Default: 10%</p>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-2xl card-shadow p-6 space-y-4">
          <h2 className="font-semibold text-stone-800">Invoice defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Invoice prefix</label>
              <input name="invoicePrefix" defaultValue={user.invoicePrefix} placeholder="INV" className={inputClass} style={ringStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Payment terms (days)</label>
              <input name="paymentTerms" type="number" min="1" defaultValue={user.paymentTerms} className={inputClass} style={ringStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Default invoice notes</label>
            <textarea
              name="invoiceNotes"
              defaultValue={user.invoiceNotes ?? ""}
              rows={3}
              placeholder="e.g. Please pay within 30 days. Bank details: …"
              className={`${inputClass} resize-none`}
              style={ringStyle}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "oklch(0.62 0.22 195)" }}
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
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md p-7">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Delete your account?</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-5">
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
