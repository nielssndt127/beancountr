"use client";

import { useState } from "react";
import { createClient, updateClient, deleteClient } from "@/server/actions/clients";
import { Users, Plus, Pencil, Trash2, Mail, MapPin } from "lucide-react";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

const inputStyle = { background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL, "--tw-ring-color": GREEN } as React.CSSProperties;

type Client = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  vatId: string | null;
  notes: string | null;
  _count: { invoices: number; timeEntries: number };
};

export function ClientsClient({ clients }: { clients: Client[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await createClient(new FormData(e.currentTarget));
    setShowForm(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingClient) return;
    await updateClient(editingClient.id, new FormData(e.currentTarget));
    setEditingClient(null);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteClient(id);
    setDeleting(null);
  }

  const modal = showForm || editingClient;
  const editData = editingClient;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Clients</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Plus className="w-4 h-4" /> Add client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: BORDER }}>
            <Users className="w-6 h-6" style={{ color: MUTED }} />
          </div>
          <p className="font-medium mb-1" style={{ color: CHARCOAL }}>No clients yet</p>
          <p className="text-sm" style={{ color: MUTED }}>Add your first client to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div>
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between px-6 py-4 transition-colors" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: "#E6F2ED", color: GREEN }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: CHARCOAL }}>{client.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.email && (
                        <span className="text-xs flex items-center gap-1" style={{ color: MUTED }}>
                          <Mail className="w-3 h-3" /> {client.email}
                        </span>
                      )}
                      {client.address && (
                        <span className="text-xs flex items-center gap-1" style={{ color: MUTED }}>
                          <MapPin className="w-3 h-3" /> {client.address.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs" style={{ color: MUTED }}>{client._count.invoices} invoice{client._count.invoices !== 1 ? "s" : ""}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{client._count.timeEntries} time entries</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: MUTED }}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deleting === client.id}
                      className="p-2 rounded-lg transition-colors disabled:opacity-50"
                      style={{ color: MUTED }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md" style={{ background: CREAM, border: `1px solid ${BORDER}` }}>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <h2 className="font-semibold" style={{ color: CHARCOAL }}>{editData ? "Edit client" : "New client"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Name *</label>
                <input name="name" defaultValue={editData?.name} required className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Email</label>
                <input name="email" type="email" defaultValue={editData?.email ?? ""} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Address</label>
                <input name="address" defaultValue={editData?.address ?? ""} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>VAT ID</label>
                <input name="vatId" defaultValue={editData?.vatId ?? ""} placeholder="e.g. GB123456789" className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: CHARCOAL }}>Notes</label>
                <textarea name="notes" defaultValue={editData?.notes ?? ""} rows={2} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none" style={inputStyle} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); }} className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors" style={{ border: `1px solid ${BORDER}`, color: MUTED }}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
                  {editData ? "Save changes" : "Add client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
