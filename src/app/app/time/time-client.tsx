"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createTimeEntry, updateTimeEntry, deleteTimeEntry } from "@/server/actions/time-entries";
import { createClientByName } from "@/server/actions/clients";
import { Clock, Plus, Check, X, Trash2, Play, Pause, Square } from "lucide-react";

type Client = { id: string; name: string };
type TimeEntry = {
  id: string; date: Date; hours: number; rate: number;
  entryType: string; dayRate: number | { toNumber: () => number };
  days: number | { toNumber: () => number };
  project: string | null; notes: string | null; invoiceId: string | null;
  client: Client;
};

function toNum(v: number | { toNumber: () => number }): number {
  return typeof v === "object" && "toNumber" in v ? v.toNumber() : v as number;
}
const fmt = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
const toDateInput = (d: Date) => new Date(d).toISOString().split("T")[0];
const today = () => new Date().toISOString().split("T")[0];
function fmtSeconds(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [h, m, sec].map(n => String(n).padStart(2, "0")).join(":");
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function entryValue(e: TimeEntry) {
  return e.entryType === "DAILY" ? toNum(e.days) * toNum(e.dayRate) : e.hours * e.rate;
}

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const AMBER = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};

type ManualRow = { clientName: string; project: string; date: string; entryType: string; hours: string; rate: string; dayRate: string; days: string; notes: string };
const emptyManual = (): ManualRow => ({ clientName: "", project: "", date: today(), entryType: "HOURLY", hours: "", rate: "", dayRate: "", days: "", notes: "" });

type TimerState = "idle" | "running" | "paused" | "stopped";
type TimerEntry = { clientName: string; project: string; rate: string };

export function TimeClient({ entries, clients, defaultRate }: { entries: TimeEntry[]; clients: Client[]; defaultRate: number }) {
  // Manual inline row
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<ManualRow>(emptyManual());
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<ManualRow>(emptyManual());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Timer
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [timerEntry, setTimerEntry] = useState<TimerEntry>({ clientName: "", project: "", rate: String(defaultRate || 75) });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0); // total non-paused seconds
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [stoppedAt, setStoppedAt] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tickTimer = useCallback(() => {
    setElapsed(e => e + 1);
  }, []);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(tickTimer, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState, tickTimer]);

  function startTimer() {
    setStartTime(new Date());
    setElapsed(0);
    setTimerState("running");
  }

  function pauseTimer() {
    setPausedAt(new Date());
    setTimerState("paused");
  }

  function resumeTimer() {
    setPausedAt(null);
    setTimerState("running");
  }

  function stopTimer() {
    setStoppedAt(new Date());
    setTimerState("stopped");
  }

  function discardTimer() {
    setTimerState("idle");
    setElapsed(0);
    setStartTime(null);
    setStoppedAt(null);
    setPausedAt(null);
    setTimerEntry({ clientName: "", project: "", rate: String(defaultRate || 75) });
  }

  async function saveTimer() {
    if (!startTime || saving) return;
    setSaving(true);
    const hours = elapsed / 3600;
    const fd = new FormData();
    fd.set("entryType", "HOURLY");
    fd.set("hours", String(Math.round(hours * 100) / 100));
    fd.set("rate", timerEntry.rate || String(defaultRate || 75));
    fd.set("date", toDateInput(startTime));
    fd.set("project", timerEntry.project);
    fd.set("notes", `Timer: ${fmtTime(startTime)} → ${fmtTime(stoppedAt ?? new Date())}`);

    let clientId = "";
    if (timerEntry.clientName.trim()) {
      const c = clients.find(c => c.name.toLowerCase() === timerEntry.clientName.toLowerCase());
      if (c) { clientId = c.id; }
      else {
        const newC = await createClientByName(timerEntry.clientName.trim());
        clientId = newC.id;
      }
    }
    fd.set("clientId", clientId);
    await createTimeEntry(fd);
    discardTimer();
    setSaving(false);
  }

  async function saveNew() {
    if (!newRow.clientName.trim() || saving) return;
    setSaving(true);
    const fd = new FormData();
    const c = clients.find(c => c.name.toLowerCase() === newRow.clientName.toLowerCase());
    let clientId = c?.id ?? "";
    if (!clientId && newRow.clientName.trim()) {
      const newC = await createClientByName(newRow.clientName.trim());
      clientId = newC.id;
    }
    fd.set("clientId", clientId);
    fd.set("entryType", newRow.entryType);
    fd.set("project", newRow.project);
    fd.set("date", newRow.date);
    fd.set("hours", newRow.hours || "0");
    fd.set("rate", newRow.rate || "0");
    fd.set("dayRate", newRow.dayRate || "0");
    fd.set("days", newRow.days || "0");
    fd.set("notes", newRow.notes);
    await createTimeEntry(fd);
    setAdding(false); setNewRow(emptyManual()); setSaving(false);
  }

  async function saveEdit() {
    if (!editId || saving) return;
    setSaving(true);
    const fd = new FormData();
    const c = clients.find(c => c.name.toLowerCase() === editRow.clientName.toLowerCase());
    fd.set("clientId", c?.id ?? "");
    fd.set("entryType", editRow.entryType);
    fd.set("project", editRow.project);
    fd.set("date", editRow.date);
    fd.set("hours", editRow.hours || "0");
    fd.set("rate", editRow.rate || "0");
    fd.set("dayRate", editRow.dayRate || "0");
    fd.set("days", editRow.days || "0");
    fd.set("notes", editRow.notes);
    await updateTimeEntry(editId, fd);
    setEditId(null); setSaving(false);
  }

  function startEdit(e: TimeEntry) {
    setEditId(e.id);
    const isDaily = e.entryType === "DAILY";
    setEditRow({
      clientName: e.client.name, project: e.project ?? "", date: toDateInput(e.date),
      entryType: e.entryType,
      hours: isDaily ? "" : String(e.hours), rate: isDaily ? "" : String(e.rate),
      dayRate: isDaily ? String(toNum(e.dayRate)) : "", days: isDaily ? String(toNum(e.days)) : "",
      notes: e.notes ?? "",
    });
  }

  const totalHours = entries.filter(e => e.entryType === "HOURLY").reduce((s, e) => s + e.hours, 0);
  const totalValue = entries.reduce((s, e) => s + entryValue(e), 0);

  const TH = ({ label, w }: { label: string; w?: string }) => (
    <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: MUTED, borderBottom: `1px solid ${BORDER}`, width: w }}>
      {label}
    </th>
  );

  const SaveCancel = ({ onSave, onCancel, disabled }: { onSave: () => void; onCancel: () => void; disabled?: boolean }) => (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onSave} disabled={disabled || saving} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition-all" style={{ background: GREEN }}>
        <Check className="w-3.5 h-3.5 text-white" />
      </button>
      <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ border: `1px solid ${BORDER}` }}>
        <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
      </button>
    </div>
  );

  const ManualRowFields = ({ row, set }: { row: ManualRow; set: (fn: (r: ManualRow) => ManualRow) => void }) => (
    <>
      <td className="px-3 py-2"><input placeholder="Client *" value={row.clientName} onChange={e => set(r => ({ ...r, clientName: e.target.value }))} style={cell} list="client-list" /></td>
      <td className="px-3 py-2"><input placeholder="Project" value={row.project} onChange={e => set(r => ({ ...r, project: e.target.value }))} style={cell} /></td>
      <td className="px-3 py-2"><input type="date" value={row.date} onChange={e => set(r => ({ ...r, date: e.target.value }))} style={cell} /></td>
      <td className="px-3 py-2">
        <select value={row.entryType} onChange={e => set(r => ({ ...r, entryType: e.target.value }))} style={{ ...cell, cursor: "pointer" }}>
          <option value="HOURLY">Hourly</option>
          <option value="DAILY">Daily</option>
        </select>
      </td>
      {row.entryType === "HOURLY" ? (
        <>
          <td className="px-3 py-2"><input type="number" step="0.25" min="0" placeholder="Hrs" value={row.hours} onChange={e => set(r => ({ ...r, hours: e.target.value }))} style={cell} /></td>
          <td className="px-3 py-2"><input type="number" step="1" min="0" placeholder="Rate £" value={row.rate} onChange={e => set(r => ({ ...r, rate: e.target.value }))} style={cell} /></td>
        </>
      ) : (
        <>
          <td className="px-3 py-2"><input type="number" step="0.5" min="0" placeholder="Days" value={row.days} onChange={e => set(r => ({ ...r, days: e.target.value }))} style={cell} /></td>
          <td className="px-3 py-2"><input type="number" step="1" min="0" placeholder="Day rate £" value={row.dayRate} onChange={e => set(r => ({ ...r, dayRate: e.target.value }))} style={cell} /></td>
        </>
      )}
      <td className="px-3 py-2"><input placeholder="Notes" value={row.notes} onChange={e => set(r => ({ ...r, notes: e.target.value }))} style={cell} /></td>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <datalist id="client-list">
        {clients.map(c => <option key={c.id} value={c.name} />)}
      </datalist>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL }}>Time tracking</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            <span className="font-mono">{totalHours.toFixed(1)}h</span> logged · <span className="font-mono">{fmt(totalValue)}</span> value
          </p>
        </div>
        <div className="flex items-center gap-2">
          {timerState === "idle" && (
            <button onClick={startTimer} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: GREEN, color: "#fff" }}>
              <Play className="w-4 h-4" /> Start timer
            </button>
          )}
          {!adding && timerState === "idle" && (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: KHAKI, color: CHARCOAL }}>
              <Plus className="w-4 h-4" /> Add manually
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm min-w-[800px]">
          <thead style={{ background: KHAKI }}>
            <tr>
              <TH label="Client" />
              <TH label="Project" />
              <TH label="Date" w="110px" />
              <TH label="Type" w="80px" />
              <TH label="Hours / Days" w="100px" />
              <TH label="Rate" w="90px" />
              <TH label="Notes" />
              <TH label="Value" w="90px" />
              <th style={{ width: 72, borderBottom: `1px solid ${BORDER}` }} />
            </tr>
          </thead>
          <tbody>
            {/* Live timer row */}
            {timerState !== "idle" && (
              <tr style={{ background: timerState === "stopped" ? "#F0F9F4" : timerState === "paused" ? "#FFF8F0" : "#F0FFF8", borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-2">
                  <input placeholder="Client" value={timerEntry.clientName} onChange={e => setTimerEntry(t => ({ ...t, clientName: e.target.value }))} style={cell} list="client-list" />
                </td>
                <td className="px-3 py-2">
                  <input placeholder="Project" value={timerEntry.project} onChange={e => setTimerEntry(t => ({ ...t, project: e.target.value }))} style={cell} />
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>
                  {startTime && fmtTime(startTime)} → {timerState === "stopped" && stoppedAt ? fmtTime(stoppedAt) : "now"}
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>Hourly</td>
                <td className="px-3 py-2">
                  <span className="font-mono text-sm font-bold" style={{ color: timerState === "paused" ? AMBER : timerState === "stopped" ? GREEN : CHARCOAL }}>
                    {timerState === "paused" ? `⏸ ${fmtSeconds(elapsed)}` : fmtSeconds(elapsed)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input type="number" placeholder="Rate £" value={timerEntry.rate} onChange={e => setTimerEntry(t => ({ ...t, rate: e.target.value }))} style={{ ...cell, width: "70px" }} />
                </td>
                <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>
                  {timerState === "stopped" ? "Timer entry" : timerState === "paused" ? "On break" : "Running…"}
                </td>
                <td className="px-3 py-2 font-mono text-sm font-semibold" style={{ color: GREEN }}>
                  {fmt((elapsed / 3600) * parseFloat(timerEntry.rate || "0"))}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 justify-end">
                    {timerState === "running" && (
                      <button onClick={pauseTimer} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ background: LIGHT_AMBER, color: AMBER }} title="Pause">
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {timerState === "paused" && (
                      <button onClick={resumeTimer} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ background: LIGHT_GREEN, color: GREEN }} title="Resume">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(timerState === "running" || timerState === "paused") && (
                      <button onClick={stopTimer} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ background: CHARCOAL, color: "#fff" }} title="Stop">
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {timerState === "stopped" && (
                      <button onClick={saveTimer} disabled={saving} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 disabled:opacity-40 transition-all" style={{ background: GREEN }} title="Save">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                    <button onClick={discardTimer} className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all" style={{ border: `1px solid ${BORDER}` }} title="Discard">
                      <X className="w-3.5 h-3.5" style={{ color: MUTED }} />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Manual new row */}
            {adding && (
              <tr style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <ManualRowFields row={newRow} set={setNewRow} />
                <td className="px-3 py-2 font-mono text-sm" style={{ color: MUTED }}>
                  {newRow.entryType === "HOURLY"
                    ? fmt((parseFloat(newRow.hours) || 0) * (parseFloat(newRow.rate) || 0))
                    : fmt((parseFloat(newRow.days) || 0) * (parseFloat(newRow.dayRate) || 0))}
                </td>
                <td className="px-3 py-2"><SaveCancel onSave={saveNew} onCancel={() => { setAdding(false); setNewRow(emptyManual()); }} disabled={!newRow.clientName.trim()} /></td>
              </tr>
            )}

            {entries.length === 0 && !adding && timerState === "idle" ? (
              <tr>
                <td colSpan={9} className="px-6 py-14 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: MUTED }} />
                  <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No time entries yet</p>
                  <p className="text-sm" style={{ color: MUTED }}>Hit "Start timer" or "Add manually" above.</p>
                </td>
              </tr>
            ) : entries.map((e) => editId === e.id ? (
              <tr key={e.id} style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <ManualRowFields row={editRow} set={setEditRow} />
                <td className="px-3 py-2 font-mono text-sm" style={{ color: MUTED }}>
                  {editRow.entryType === "HOURLY"
                    ? fmt((parseFloat(editRow.hours) || 0) * (parseFloat(editRow.rate) || 0))
                    : fmt((parseFloat(editRow.days) || 0) * (parseFloat(editRow.dayRate) || 0))}
                </td>
                <td className="px-3 py-2"><SaveCancel onSave={saveEdit} onCancel={() => setEditId(null)} /></td>
              </tr>
            ) : (
              <tr key={e.id} onClick={() => startEdit(e)} className="cursor-pointer group transition-colors hover:bg-[#F0F9F4]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: LIGHT_GREEN, color: GREEN }}>
                      {e.client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: CHARCOAL }}>{e.client.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{e.project ?? "—"}</td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{fmtDate(e.date)}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: e.entryType === "DAILY" ? LIGHT_AMBER : LIGHT_GREEN, color: e.entryType === "DAILY" ? AMBER : GREEN }}>
                    {e.entryType === "DAILY" ? "Daily" : "Hourly"}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-sm" style={{ color: CHARCOAL }}>
                  {e.entryType === "DAILY" ? `${toNum(e.days)}d` : `${e.hours}h`}
                </td>
                <td className="px-3 py-3 font-mono text-sm" style={{ color: MUTED }}>
                  {e.entryType === "DAILY" ? `£${toNum(e.dayRate)}/d` : `£${e.rate}/h`}
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{e.notes ?? "—"}</td>
                <td className="px-3 py-3 font-mono text-sm font-semibold" style={{ color: GREEN }}>{fmt(entryValue(e))}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={ev => { ev.stopPropagation(); setDeleting(e.id); deleteTimeEntry(e.id).then(() => setDeleting(null)); }} disabled={deleting === e.id} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40" style={{ color: MUTED }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
