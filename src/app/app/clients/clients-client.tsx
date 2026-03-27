"use client";

import { useState } from "react";
import { createClient, updateClient, deleteClient } from "@/server/actions/clients";
import { Users, Plus, Check, X, Trash2 } from "lucide-react";

const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const KHAKI = "#EAE3D2";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

type Client = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  vatId: string | null;
  notes: string | null;
  _count: { invoices: number; timeEntries: number };
};

type Row = { name: string; email: string; address: string; vatId: string; notes: string };
const empty: Row = { name: "", email: "", address: "", vatId: "", notes: "" };

const cell: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: `2px solid ${GREEN}`,
  outline: "none", color: CHARCOAL, fontSize: "13px", padding: "2px 4px", width: "100%",
};

export function ClientsClient({ clients }: { clients: Client[] }) {
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Row>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Row>(empty);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveNew() {
    if (!newRow.name.trim() || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(newRow).forEach(([k, v]) => fd.set(k, v));
    await createClient(fd);
    setAdding(false); setNewRow(empty); setSaving(false);
  }

  async function saveEdit() {
    if (!editId || saving) return;
    setSaving(true);
    const fd = new FormData();
    Object.entries(editRow).forEach(([k, v]) => fd.set(k, v));
    await updateClient(editId, fd);
    setEditId(null); setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteClient(id);
    setDeleting(null);
  }

  function startEdit(c: Client) {
    setEditId(c.id);
    setEditRow({ name: c.name, email: c.email ?? "", address: c.address ?? "", vatId: c.vatId ?? "", notes: c.notes ?? "" });
  }

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

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: CHARCOAL }}>Clients</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: GREEN, color: "#fff" }}>
            <Plus className="w-4 h-4" /> Add client
          </button>
        )}
      </div>

      <div className="rounded-2xl overflow-x-auto" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <table className="w-full text-sm min-w-[700px]">
          <thead style={{ background: KHAKI }}>
            <tr>
              <TH label="Name" />
              <TH label="Email" />
              <TH label="Address" />
              <TH label="VAT ID" w="110px" />
              <TH label="Notes" />
              <TH label="Activity" w="120px" />
              <th style={{ width: 72, borderBottom: `1px solid ${BORDER}` }} />
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-2"><input autoFocus placeholder="Client name *" value={newRow.name} onChange={e => setNewRow(r => ({ ...r, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveNew()} style={cell} /></td>
                <td className="px-3 py-2"><input placeholder="Email" value={newRow.email} onChange={e => setNewRow(r => ({ ...r, email: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input placeholder="Address" value={newRow.address} onChange={e => setNewRow(r => ({ ...r, address: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input placeholder="GB123456789" value={newRow.vatId} onChange={e => setNewRow(r => ({ ...r, vatId: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input placeholder="Notes" value={newRow.notes} onChange={e => setNewRow(r => ({ ...r, notes: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>—</td>
                <td className="px-3 py-2"><SaveCancel onSave={saveNew} onCancel={() => { setAdding(false); setNewRow(empty); }} disabled={!newRow.name.trim()} /></td>
              </tr>
            )}
            {clients.length === 0 && !adding ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3" style={{ color: MUTED }} />
                  <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No clients yet</p>
                  <p className="text-sm" style={{ color: MUTED }}>Click "Add client" above to get started.</p>
                </td>
              </tr>
            ) : clients.map((c) => editId === c.id ? (
              <tr key={c.id} style={{ background: "#F0F9F4", borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-2"><input autoFocus value={editRow.name} onChange={e => setEditRow(r => ({ ...r, name: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveEdit()} style={cell} /></td>
                <td className="px-3 py-2"><input value={editRow.email} onChange={e => setEditRow(r => ({ ...r, email: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input value={editRow.address} onChange={e => setEditRow(r => ({ ...r, address: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input value={editRow.vatId} onChange={e => setEditRow(r => ({ ...r, vatId: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2"><input value={editRow.notes} onChange={e => setEditRow(r => ({ ...r, notes: e.target.value }))} style={cell} /></td>
                <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>{c._count.invoices} inv</td>
                <td className="px-3 py-2"><SaveCancel onSave={saveEdit} onCancel={() => setEditId(null)} /></td>
              </tr>
            ) : (
              <tr key={c.id} onClick={() => startEdit(c)} className="cursor-pointer group transition-colors hover:bg-[#F0F9F4]" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: LIGHT_GREEN, color: GREEN }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: CHARCOAL }}>{c.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{c.email ?? "—"}</td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{c.address?.split(",")[0] ?? "—"}</td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{c.vatId ?? "—"}</td>
                <td className="px-3 py-3 text-sm" style={{ color: MUTED }}>{c.notes ? c.notes.slice(0, 30) + (c.notes.length > 30 ? "…" : "") : "—"}</td>
                <td className="px-3 py-3 text-xs" style={{ color: MUTED }}>{c._count.invoices} inv · {c._count.timeEntries} entries</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} disabled={deleting === c.id} className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-40" style={{ color: MUTED }}>
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
