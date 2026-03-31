"use client";

import { useState, useMemo } from "react";
import { sendAdminEmail } from "@/server/actions/admin";
import { Users, TrendingUp, AlertCircle, Zap, Mail, X, Check, Search } from "lucide-react";

const CHARCOAL = "#1F1F1F";
const GREEN    = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD     = "#FDFAF4";
const BORDER   = "rgba(31,31,31,0.1)";
const MUTED    = "rgba(31,31,31,0.55)";
const AMBER    = "#D4A373";
const LIGHT_AMBER = "#F6E7D8";

type UserRow = {
  id: string;
  email: string;
  fullName: string | null;
  businessName: string | null;
  plan: "FREE" | "PRO";
  createdAt: Date;
  lastActive: Date | null;
  _count: {
    invoices: number;
    timeEntries: number;
    expenses: number;
    clients: number;
    quotes: number;
  };
};

type Metrics = {
  total: number;
  pro: number;
  activeThirtyDays: number;
  newThisMonth: number;
  dormant: number;
};

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—";

const daysAgo = (d: Date | null) => {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color ?? LIGHT_GREEN }}>
          <Icon className="w-4 h-4" style={{ color: GREEN }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color: CHARCOAL }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: MUTED }}>{sub}</p>}
    </div>
  );
}

export function AdminClient({ users, metrics }: { users: UserRow[]; metrics: Metrics }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pro" | "free" | "dormant" | "active">("all");
  const [emailModal, setEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState<"all" | "pro" | "free" | string>("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; errors: string[] } | null>(null);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const filtered = useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.email.toLowerCase().includes(q) ||
        (u.fullName ?? "").toLowerCase().includes(q) ||
        (u.businessName ?? "").toLowerCase().includes(q)
      );
    }
    if (filter === "pro") list = list.filter(u => u.plan === "PRO");
    if (filter === "free") list = list.filter(u => u.plan === "FREE");
    if (filter === "active") list = list.filter(u => u.lastActive && new Date(u.lastActive) >= thirtyDaysAgo);
    if (filter === "dormant") list = list.filter(u => !u.lastActive || new Date(u.lastActive) < thirtyDaysAgo);
    return list;
  }, [users, search, filter]);

  function getEmailList(): string[] {
    if (emailTo === "all") return users.map(u => u.email);
    if (emailTo === "pro") return users.filter(u => u.plan === "PRO").map(u => u.email);
    if (emailTo === "free") return users.filter(u => u.plan === "FREE").map(u => u.email);
    return [emailTo];
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim() || sending) return;
    setSending(true);
    setSendResult(null);
    try {
      const to = getEmailList();
      const result = await sendAdminEmail(to, subject, body);
      setSendResult(result);
    } finally {
      setSending(false);
    }
  }

  function openEmailTo(email: string) {
    setEmailTo(email);
    setSubject("");
    setBody("");
    setSendResult(null);
    setEmailModal(true);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>Admin</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>User behaviour &amp; health dashboard</p>
        </div>
        <button
          onClick={() => { setEmailTo("all"); setSubject(""); setBody(""); setSendResult(null); setEmailModal(true); }}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full transition-all hover:opacity-90"
          style={{ background: GREEN, color: "#fff" }}
        >
          <Mail className="w-4 h-4" /> Email users
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users}      label="Total users"    value={metrics.total}            sub="All time" />
        <StatCard icon={Zap}        label="Pro"            value={metrics.pro}              sub={`${Math.round(metrics.pro / Math.max(metrics.total, 1) * 100)}% of users`} color={LIGHT_GREEN} />
        <StatCard icon={TrendingUp} label="Active 30 days" value={metrics.activeThirtyDays} sub="Created something" color={LIGHT_GREEN} />
        <StatCard icon={Users}      label="New this month" value={metrics.newThisMonth}     sub="Signed up" />
        <StatCard icon={AlertCircle} label="Dormant"       value={metrics.dormant}          sub="No activity ever" color={LIGHT_AMBER} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2 rounded-xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
          <input
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: CHARCOAL }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-full" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {(["all", "pro", "free", "active", "dormant"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
              style={filter === f ? { background: GREEN, color: "#fff" } : { color: MUTED }}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: MUTED }}>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* User table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["User", "Plan", "Clients", "Quotes", "Invoices", "Time", "Expenses", "Last active", "Signed up", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm" style={{ color: MUTED }}>No users match this filter</td>
                </tr>
              )}
              {filtered.map(u => {
                const da = daysAgo(u.lastActive);
                const atRisk = u.plan === "FREE" && (!u.lastActive || new Date(u.lastActive) < thirtyDaysAgo);
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs" style={{ color: CHARCOAL }}>
                        {u.fullName ?? u.businessName ?? u.email.split("@")[0]}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: MUTED }}>{u.email}</p>
                      {atRisk && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ background: LIGHT_AMBER, color: AMBER }}>at risk</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={u.plan === "PRO"
                          ? { background: LIGHT_GREEN, color: GREEN }
                          : { background: "#EAE3D2", color: MUTED }
                        }
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: CHARCOAL }}>{u._count.clients}</td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: CHARCOAL }}>{u._count.quotes}</td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: CHARCOAL }}>{u._count.invoices}</td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: CHARCOAL }}>{u._count.timeEntries}</td>
                    <td className="px-4 py-3 text-xs text-center" style={{ color: CHARCOAL }}>{u._count.expenses}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: da !== null && da > 30 ? AMBER : MUTED }}>
                      {da !== null ? `${da}d ago` : "Never"}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: MUTED }}>{fmt(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEmailTo(u.email)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                        style={{ background: LIGHT_GREEN }}
                        title={`Email ${u.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" style={{ color: GREEN }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background: CARD }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <p className="font-semibold" style={{ color: CHARCOAL }}>Send email</p>
              <button onClick={() => setEmailModal(false)} style={{ color: MUTED }}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* To */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>To</label>
                <select
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL }}
                >
                  <option value="all">All users ({users.length})</option>
                  <option value="pro">Pro users only ({users.filter(u => u.plan === "PRO").length})</option>
                  <option value="free">Free users only ({users.filter(u => u.plan === "FREE").length})</option>
                  <optgroup label="Individual users">
                    {users.map(u => (
                      <option key={u.id} value={u.email}>
                        {u.fullName ?? u.email} ({u.email})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <p className="text-xs" style={{ color: MUTED }}>
                  Sending to {getEmailList().length} recipient{getEmailList().length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Subject line…"
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL }}
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Message</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your message here. Use line breaks for paragraphs."
                  rows={7}
                  className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                  style={{ background: "#fff", border: `1px solid ${BORDER}`, color: CHARCOAL }}
                />
                <p className="text-xs" style={{ color: MUTED }}>Plain text. Line breaks become paragraphs. Sent from hello@beancountr.co.uk</p>
              </div>

              {/* Result */}
              {sendResult && (
                <div
                  className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{
                    background: sendResult.errors.length ? LIGHT_AMBER : LIGHT_GREEN,
                    border: `1px solid ${sendResult.errors.length ? AMBER : GREEN}`,
                  }}
                >
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: sendResult.errors.length ? AMBER : GREEN }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: CHARCOAL }}>
                      Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? "s" : ""}
                    </p>
                    {sendResult.errors.length > 0 && (
                      <ul className="text-xs mt-1 space-y-0.5" style={{ color: AMBER }}>
                        {sendResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setEmailModal(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ border: `1px solid ${BORDER}`, color: MUTED }}
                >
                  Close
                </button>
                <button
                  onClick={handleSend}
                  disabled={!subject.trim() || !body.trim() || sending}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                  style={{ background: GREEN, color: "#fff" }}
                >
                  <Mail className="w-4 h-4" />
                  {sending ? "Sending…" : `Send to ${getEmailList().length}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
