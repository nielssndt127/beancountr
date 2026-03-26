"use client";

import { useState, useEffect, useRef } from "react";
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from "@/server/actions/time-entries";
import { createClientByName } from "@/server/actions/clients";
import { Clock, Plus, Pencil, Trash2, Play, Pause, Square } from "lucide-react";

type Client = { id: string; name: string };
type TimeEntry = {
  id: string;
  date: Date;
  hours: number;
  rate: number;
  entryType: string;
  dayRate: number | { toNumber: () => number };
  days: number | { toNumber: () => number };
  project: string | null;
  notes: string | null;
  invoiceId: string | null;
  client: Client;
};

function toNum(v: number | { toNumber: () => number }): number {
  if (typeof v === "object" && "toNumber" in v) return v.toNumber();
  return v as number;
}

function fmt(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}
function toDateInput(date: Date) {
  return new Date(date).toISOString().split("T")[0];
}
function entryValue(e: TimeEntry): number {
  if (e.entryType === "DAILY") return toNum(e.days) * toNum(e.dayRate);
  return e.hours * e.rate;
}
function fmtSeconds(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const ringStyle = { "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties;

// ---- Toggl Timer ----
type TimerState = "idle" | "running" | "paused";

function LiveTimer({
  clients,
  onStop,
}: {
  clients: Client[];
  onStop: (desc: string, clientName: string, seconds: number) => void;
}) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  function handleStart() {
    setTimerState("running");
  }
  function handlePause() {
    setTimerState("paused");
  }
  function handleResume() {
    setTimerState("running");
  }
  function handleStop() {
    setTimerState("idle");
    const secs = elapsed;
    const desc = description;
    const name = clientName;
    setElapsed(0);
    setDescription("");
    setClientName("");
    onStop(desc, name, secs);
  }

  return (
    <div className="bg-white rounded-2xl card-shadow p-6" style={{ borderLeft: "4px solid oklch(0.72 0.22 48)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            disabled={timerState !== "idle"}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white disabled:bg-stone-50 disabled:text-stone-500"
            style={ringStyle}
          />
          <input
            list="timer-clients"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={timerState !== "idle"}
            placeholder="Client name (type or pick existing)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white disabled:bg-stone-50 disabled:text-stone-500"
            style={ringStyle}
          />
          <datalist id="timer-clients">
            {clients.map((c) => <option key={c.id} value={c.name} />)}
          </datalist>
        </div>

        <div className="flex flex-col items-center gap-3 sm:ml-4">
          <span
            className="font-mono text-4xl font-bold tracking-widest"
            style={{ color: timerState === "idle" ? "oklch(0.72 0.35 48)" : timerState === "running" ? "oklch(0.72 0.22 48)" : "oklch(0.65 0.18 48)" }}
          >
            {fmtSeconds(elapsed)}
          </span>

          <div className="flex items-center gap-2">
            {timerState === "idle" && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "oklch(0.55 0.18 145)" }}
              >
                <Play className="w-4 h-4" /> Start
              </button>
            )}
            {timerState === "running" && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "oklch(0.75 0.18 85)" }}
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "oklch(0.60 0.22 25)" }}
                >
                  <Square className="w-4 h-4" /> Stop
                </button>
              </>
            )}
            {timerState === "paused" && (
              <>
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "oklch(0.55 0.18 145)" }}
                >
                  <Play className="w-4 h-4" /> Resume
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "oklch(0.60 0.22 25)" }}
                >
                  <Square className="w-4 h-4" /> Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----
export function TimeClient({ timeEntries, clients }: { timeEntries: TimeEntry[]; clients: Client[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Pre-fill state for timer stop
  const [prefill, setPrefill] = useState<{
    description: string;
    clientId: string;
    hours: string;
    date: string;
  } | null>(null);

  // Entry type toggle in modal
  const [entryType, setEntryType] = useState<"HOURLY" | "DAILY">("HOURLY");

  const totalValue = timeEntries.reduce((sum, e) => sum + entryValue(e), 0);
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours + toNum(e.days) * 8, 0);

  function openNewForm(pre?: { description: string; clientId: string; hours: string; date: string }) {
    setPrefill(pre ?? null);
    setEntryType("HOURLY");
    setShowForm(true);
  }

  function closeModal() {
    setShowForm(false);
    setEditingEntry(null);
    setPrefill(null);
    setEntryType("HOURLY");
  }

  function handleEditOpen(entry: TimeEntry) {
    setEditingEntry(entry);
    setEntryType((entry.entryType as "HOURLY" | "DAILY") || "HOURLY");
  }

  async function handleTimerStop(description: string, clientName: string, seconds: number) {
    const hours = (seconds / 3600).toFixed(2);
    const date = new Date().toISOString().split("T")[0];
    let clientId = "";
    if (clientName.trim()) {
      const client = await createClientByName(clientName.trim());
      clientId = client.id;
    }
    openNewForm({ description, clientId, hours, date });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const clientName = fd.get("clientName") as string;
    if (clientName?.trim()) {
      const client = await createClientByName(clientName.trim());
      fd.set("clientId", client.id);
    }
    fd.set("entryType", entryType);
    await createTimeEntry(fd);
    closeModal();
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingEntry) return;
    const fd = new FormData(e.currentTarget);
    const clientName = fd.get("clientName") as string;
    if (clientName?.trim()) {
      const client = await createClientByName(clientName.trim());
      fd.set("clientId", client.id);
    }
    fd.set("entryType", entryType);
    await updateTimeEntry(editingEntry.id, fd);
    closeModal();
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
          onClick={() => openNewForm()}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: "oklch(0.62 0.22 195)" }}
        >
          <Plus className="w-4 h-4" /> Log time
        </button>
      </div>

      {/* Live Timer */}
      <LiveTimer clients={clients} onStop={handleTimerStop} />

      {timeEntries.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-stone-300" />
          </div>
          <p className="font-medium text-stone-700 mb-1">No time entries yet</p>
          <p className="text-sm text-stone-400">Start the timer above or log time manually.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="divide-y divide-stone-50">
            {timeEntries.map((entry) => {
              const isDaily = entry.entryType === "DAILY";
              const daysNum = toNum(entry.days);
              const dayRateNum = toNum(entry.dayRate);
              return (
                <div key={entry.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                      {isDaily ? (
                        <>
                          <p className="text-lg font-bold text-stone-900 font-data">{daysNum}</p>
                          <p className="text-xs text-stone-400">days</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-stone-900 font-data">{entry.hours}</p>
                          <p className="text-xs text-stone-400">hrs</p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{entry.project || "Untitled project"}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{entry.client.name} · {fmtDate(entry.date)}</p>
                      {entry.notes && <p className="text-xs text-stone-400 mt-0.5 italic">{entry.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-800 font-data">{fmt(entryValue(entry))}</p>
                      {isDaily ? (
                        <p className="text-xs text-stone-400">{fmt(dayRateNum)}/day</p>
                      ) : (
                        <p className="text-xs text-stone-400">{fmt(entry.rate)}/hr</p>
                      )}
                      {entry.invoiceId && <p className="text-xs text-emerald-500 mt-0.5">Invoiced</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditOpen(entry)} className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">{editData ? "Edit time entry" : "Log time"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              {/* Entry type toggle */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Entry type</label>
                <div className="flex rounded-xl border border-stone-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setEntryType("HOURLY")}
                    className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={entryType === "HOURLY" ? { background: "oklch(0.62 0.22 195)", color: "white" } : { background: "white", color: "oklch(0.4 0 0)" }}
                  >
                    Hourly
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType("DAILY")}
                    className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={entryType === "DAILY" ? { background: "oklch(0.62 0.22 195)", color: "white" } : { background: "white", color: "oklch(0.4 0 0)" }}
                  >
                    Daily
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Client *</label>
                <input
                  list="modal-clients"
                  name="clientName"
                  defaultValue={prefill?.clientId ? clients.find(c => c.id === prefill.clientId)?.name ?? "" : editData?.client.name ?? ""}
                  required
                  placeholder="Type client name or pick existing"
                  className={inputClass}
                  style={ringStyle}
                />
                <datalist id="modal-clients">
                  {clients.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Project / Description</label>
                <input name="project" defaultValue={prefill?.description ?? editData?.project ?? ""} placeholder="e.g. Website redesign" className={inputClass} style={ringStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Date *</label>
                <input name="date" type="date" defaultValue={prefill?.date ?? (editData ? toDateInput(editData.date) : new Date().toISOString().split("T")[0])} required className={inputClass} style={ringStyle} />
              </div>

              {entryType === "HOURLY" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Hours *</label>
                    <input name="hours" type="number" step="0.25" min="0.25" defaultValue={prefill?.hours ?? editData?.hours ?? "1"} required className={inputClass} style={ringStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Hourly rate (£) *</label>
                    <input name="rate" type="number" step="0.01" min="0" defaultValue={editData?.rate ?? "75"} required className={inputClass} style={ringStyle} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Days *</label>
                    <input name="days" type="number" step="0.5" min="0.5" defaultValue={editData ? toNum(editData.days) || "1" : "1"} required className={inputClass} style={ringStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Day rate (£) *</label>
                    <input name="dayRate" type="number" step="0.01" min="0" defaultValue={editData ? toNum(editData.dayRate) || "400" : "400"} required className={inputClass} style={ringStyle} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <input name="notes" defaultValue={editData?.notes ?? ""} placeholder="Optional note" className={inputClass} style={ringStyle} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
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
