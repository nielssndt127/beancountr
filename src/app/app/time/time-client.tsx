"use client";

import { useState } from "react";
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from "@/server/actions/time-entries";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";

type Client = { id: string; name: string };
type TimeEntry = {
  id: string;
  date: Date;
  hours: number;
  rate: number;
  project: string | null;
  notes: string | null;
  invoiceId: string | null;
  client: Client;
};

function fmt(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}
function toDateInput(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const ringStyle = { "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties;

export function TimeClient({ timeEntries, clients }: { timeEntries: TimeEntry[]; clients: Client[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalValue = timeEntries.reduce((sum, e) => sum + e.hours * e.rate, 0);
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createTimeEntry(new FormData(e.currentTarget));
    setShowForm(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingEntry) return;
    await updateTimeEntry(editingEntry.id, new FormData(e.currentTarget));
    setEditingEntry(null);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteTimeEntry(id);
    setDeleting(null);
  }

  const modal = showForm || editingEntry;
  const editData = editingEntry;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Time entries</h1>
          <p className="text-stone-400 text-sm mt-1">
            <span className="font-data">{totalHours.toFixed(1)}h</span> logged · <span className="font-data">{fmt(totalValue)}</span> total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: "oklch(0.62 0.22 195)" }}
        >
          <Plus className="w-4 h-4" /> Log time
        </button>
      </div>

      {timeEntries.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-stone-300" />
          </div>
          <p className="font-medium text-stone-700 mb-1">No time entries yet</p>
          <p className="text-sm text-stone-400">Start logging your hours to track billable time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="divide-y divide-stone-50">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center w-10">
                    <p className="text-lg font-bold text-stone-900 font-data">{entry.hours}</p>
                    <p className="text-xs text-stone-400">hrs</p>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{entry.project || "Untitled project"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{entry.client.name} · {fmtDate(entry.date)}</p>
                    {entry.notes && <p className="text-xs text-stone-400 mt-0.5 italic">{entry.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-800 font-data">{fmt(entry.hours * entry.rate)}</p>
                    <p className="text-xs text-stone-400">{fmt(entry.rate)}/hr</p>
                    {entry.invoiceId && <p className="text-xs text-emerald-500 mt-0.5">Invoiced</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingEntry(entry)} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">{editData ? "Edit time entry" : "Log time"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Client *</label>
                <select name="clientId" defaultValue={editData?.client.id} required className={inputClass} style={ringStyle}>
                  <option value="">Select client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Project</label>
                <input name="project" defaultValue={editData?.project ?? ""} placeholder="e.g. Website redesign" className={inputClass} style={ringStyle} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Date *</label>
                  <input name="date" type="date" defaultValue={editData ? toDateInput(editData.date) : new Date().toISOString().split("T")[0]} required className={inputClass} style={ringStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Hours *</label>
                  <input name="hours" type="number" step="0.25" min="0.25" defaultValue={editData?.hours ?? "1"} required className={inputClass} style={ringStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Hourly rate (£) *</label>
                <input name="rate" type="number" step="0.01" min="0" defaultValue={editData?.rate ?? "75"} required className={inputClass} style={ringStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <input name="notes" defaultValue={editData?.notes ?? ""} placeholder="Optional note" className={inputClass} style={ringStyle} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingEntry(null); }} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "oklch(0.62 0.22 195)" }}>
                  {editData ? "Save changes" : "Log time"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
