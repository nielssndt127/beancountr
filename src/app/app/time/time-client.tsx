"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from "@/server/actions/time-entries";
import { createClientByName } from "@/server/actions/clients";
import { Clock, Plus, Pencil, Trash2, Play, Pause, Square, AlertCircle } from "lucide-react";

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

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const AMBER = "#D4A373";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL, "--tw-ring-color": GREEN } as React.CSSProperties;
const ringStyle = inputStyle;

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
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState]);

  function handleStop() {
    const secs = elapsed;
    const desc = description;
    const name = clientName;
    setTimerState("idle");
    setElapsed(0);
    setDescription("");
    setClientName("");
    onStop(desc, name, secs);
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: KHAKI, border: `1px solid ${BORDER}` }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            disabled={timerState !== "idle"}
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
            style={inputStyle}
          />
          <input
            list="timer-clients"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            disabled={timerState !== "idle"}
            placeholder="Client name (type or pick existing)"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
            style={inputStyle}
          />
          <datalist id="timer-clients">
            {clients.map((c) => <option key={c.id} value={c.name} />)}
          </datalist>
        </div>

        <div className="flex flex-col items-center gap-3 sm:ml-4">
          <span
            className="font-mono text-4xl font-bold tracking-widest"
            style={{ color: timerState === "idle" ? MUTED : timerState === "running" ? CHARCOAL : AMBER }}
          >
            {fmtSeconds(elapsed)}
          </span>
          <div className="flex items-center gap-2">
            {timerState === "idle" && (
              <button onClick={() => setTimerState("running")} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
                <Play className="w-4 h-4" /> Start
              </button>
            )}
            {timerState === "running" && (
              <>
                <button onClick={() => setTimerState("paused")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: AMBER, color: "#fff" }}>
                  <Pause className="w-4 h-4" /> Pause
                </button>
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: CHARCOAL, color: CREAM }}>
                  <Square className="w-4 h-4" /> Stop & Log
                </button>
              </>
            )}
            {timerState === "paused" && (
              <>
                <button onClick={() => setTimerState("running")} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
                  <Play className="w-4 h-4" /> Resume
                </button>
                <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: CHARCOAL, color: CREAM }}>
                  <Square className="w-4 h-4" /> Stop & Log
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimeClient({ timeEntries, clients }: { timeEntries: TimeEntry[]; clients: Client[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [prefill, setPrefill] = useState<{
    description: string;
    clientName: string;
    hours: string;
    date: string;
  } | null>(null);

  const [entryType, setEntryType] = useState<"HOURLY" | "DAILY">("HOURLY");

  const totalValue = timeEntries.reduce((sum, e) => sum + entryValue(e), 0);
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours + toNum(e.days) * 8, 0);

  function openNewForm(pre?: { description: string; clientName: string; hours: string; date: string }) {
    setPrefill(pre ?? null);
    setEntryType("HOURLY");
    setError(null);
    setShowForm(true);
  }

  function closeModal() {
    setShowForm(false);
    setEditingEntry(null);
    setPrefill(null);
    setEntryType("HOURLY");
    setError(null);
  }

  function handleEditOpen(entry: TimeEntry) {
    setError(null);
    setEditingEntry(entry);
    setEntryType((entry.entryType as "HOURLY" | "DAILY") || "HOURLY");
  }

  // Timer stop — opens form immediately with exact seconds, no server call
  function handleTimerStop(description: string, clientName: string, seconds: number) {
    const hours = (seconds / 3600).toFixed(4);
    const date = new Date().toISOString().split("T")[0];
    openNewForm({ description, clientName, hours, date });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const clientName = fd.get("clientName") as string;
      if (clientName?.trim()) {
        const client = await createClientByName(clientName.trim());
        fd.set("clientId", client.id);
      }
      fd.set("entryType", entryType);
      await createTimeEntry(fd);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log time. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingEntry) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const clientName = fd.get("clientName") as string;
      if (clientName?.trim()) {
        const client = await createClientByName(clientName.trim());
        fd.set("clientId", client.id);
      }
      fd.set("entryType", entryType);
      await updateTimeEntry(editingEntry.id, fd);
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteTimeEntry(id);
      router.refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  }

  const modal = showForm || editingEntry;
  const editData = editingEntry;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Time entries</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-data">{totalHours.toFixed(1)}h</span> logged · <span className="font-data">{fmt(totalValue)}</span> total
          </p>
        </div>
        <button
          onClick={() => openNewForm()}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> Log time
        </button>
      </div>

      <LiveTimer clients={clients} onStop={handleTimerStop} />

      {timeEntries.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#E6F2ED" }}>
            <Clock className="w-6 h-6" style={{ color: GREEN }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No time entries yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Start the timer above or log time manually.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            {timeEntries.map((entry) => {
              const isDaily = entry.entryType === "DAILY";
              const daysNum = toNum(entry.days);
              const dayRateNum = toNum(entry.dayRate);
              return (
                <div key={entry.id} className="flex items-center justify-between px-6 py-4 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                      {isDaily ? (
                        <><p className="text-lg font-bold font-data" style={{ color: CHARCOAL }}>{daysNum}</p><p className="text-xs" style={{ color: MUTED }}>days</p></>
                      ) : (
                        <><p className="text-lg font-bold font-data" style={{ color: CHARCOAL }}>{entry.hours}</p><p className="text-xs" style={{ color: MUTED }}>hrs</p></>
                      )}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: CHARCOAL }}>{entry.project || "Untitled project"}</p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{entry.client.name} · {fmtDate(entry.date)}</p>
                      {entry.notes && <p className="text-xs mt-0.5 italic" style={{ color: MUTED }}>{entry.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold font-data" style={{ color: CHARCOAL }}>{fmt(entryValue(entry))}</p>
                      {isDaily ? <p className="text-xs" style={{ color: MUTED }}>{fmt(dayRateNum)}/day</p> : <p className="text-xs" style={{ color: MUTED }}>{fmt(entry.rate)}/hr</p>}
                      {entry.invoiceId && <p className="text-xs mt-0.5" style={{ color: GREEN }}>Invoiced</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEditOpen(entry)} className="p-2 rounded-lg transition-colors" style={{ color: MUTED }}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="p-2 rounded-lg transition-colors disabled:opacity-50"
                        style={{ color: MUTED }}
                      >
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
          <div className="rounded-2xl w-full max-w-md" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>{editData ? "Edit time entry" : "Log time"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Entry type</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                  <button type="button" onClick={() => setEntryType("HOURLY")} className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={entryType === "HOURLY" ? { background: GREEN, color: "#fff" } : { background: "#fff", color: MUTED }}>
                    Hourly
                  </button>
                  <button type="button" onClick={() => setEntryType("DAILY")} className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={entryType === "DAILY" ? { background: GREEN, color: "#fff" } : { background: "#fff", color: MUTED }}>
                    Daily
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Client *</label>
                <input
                  list="modal-clients"
                  name="clientName"
                  defaultValue={prefill?.clientName ?? editData?.client.name ?? ""}
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Project / Description</label>
                <input name="project" defaultValue={prefill?.description ?? editData?.project ?? ""} placeholder="e.g. Website redesign" className={inputClass} style={ringStyle} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Date *</label>
                <input name="date" type="date" defaultValue={prefill?.date ?? (editData ? toDateInput(editData.date) : new Date().toISOString().split("T")[0])} required className={inputClass} style={ringStyle} />
              </div>

              {entryType === "HOURLY" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Hours *</label>
                    <input name="hours" type="number" step="0.01" min="0" defaultValue={prefill?.hours ?? editData?.hours ?? "1"} required className={inputClass} style={ringStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Hourly rate (£) *</label>
                    <input name="rate" type="number" step="0.01" min="0" defaultValue={editData?.rate ?? "75"} required className={inputClass} style={ringStyle} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Days *</label>
                    <input name="days" type="number" step="0.5" min="0.5" defaultValue={editData ? toNum(editData.days) || "1" : "1"} required className={inputClass} style={ringStyle} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Day rate (£) *</label>
                    <input name="dayRate" type="number" step="0.01" min="0" defaultValue={editData ? toNum(editData.dayRate) || "400" : "400"} required className={inputClass} style={ringStyle} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Notes</label>
                <input name="notes" defaultValue={editData?.notes ?? ""} placeholder="Optional note" className={inputClass} style={ringStyle} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60" style={{ background: GREEN, color: "#fff" }}>
                  {loading ? "Saving…" : editData ? "Save changes" : "Log time"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
