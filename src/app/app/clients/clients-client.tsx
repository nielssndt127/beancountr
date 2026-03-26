"use client";

import { useState } from "react";
import { createClient, updateClient, deleteClient } from "@/server/actions/clients";
import { Users, Plus, Pencil, Trash2, Mail, MapPin } from "lucide-react";

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
          <h1 className="text-2xl font-bold text-stone-900">Clients</h1>
          <p className="text-stone-400 text-sm mt-1">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: "oklch(0.62 0.22 195)" }}
        >
          <Plus className="w-4 h-4" /> Add client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-stone-300" />
          </div>
          <p className="font-medium text-stone-700 mb-1">No clients yet</p>
          <p className="text-sm text-stone-400">Add your first client to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="divide-y divide-stone-50">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "oklch(0.62 0.22 195)" }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">{client.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {client.email && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {client.email}
                        </span>
                      )}
                      {client.address && (
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {client.address.split(",")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-stone-400">{client._count.invoices} invoice{client._count.invoices !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-stone-400">{client._count.timeEntries} time entries</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deleting === client.id}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900">{editData ? "Edit client" : "New client"}</h2>
            </div>
            <form onSubmit={editData ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
                <input name="name" defaultValue={editData?.name} required className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                <input name="email" type="email" defaultValue={editData?.email ?? ""} className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Address</label>
                <input name="address" defaultValue={editData?.address ?? ""} className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">VAT ID</label>
                <input name="vatId" defaultValue={editData?.vatId ?? ""} placeholder="e.g. GB123456789" className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent" style={{ "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Notes</label>
                <textarea name="notes" defaultValue={editData?.notes ?? ""} rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none" style={{ "--tw-ring-color": "oklch(0.62 0.22 195)" } as React.CSSProperties} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); }} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: "oklch(0.62 0.22 195)" }}>
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
