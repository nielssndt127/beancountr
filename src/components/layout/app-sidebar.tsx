"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Clock,
  Receipt,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const SIDEBAR_BG = CHARCOAL;
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(245,241,232,0.55)";
const ACTIVE_BG = "#4F7D6A";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/time", label: "Time", icon: Clock },
  { href: "/app/expenses", label: "Expenses", icon: Receipt },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex flex-col min-h-screen sticky top-0" style={{ background: SIDEBAR_BG, borderRight: `1px solid ${BORDER}` }}>
      {/* Wordmark */}
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <Link href="/app/dashboard" className="flex items-center">
          <img src="/Wordmark.png" alt="Beancountr" style={{ height: "52px", objectFit: "contain" }} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              )}
              style={
                active
                  ? { background: ACTIVE_BG, color: CREAM }
                  : { color: MUTED }
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-0.5" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          )}
          style={
            pathname === "/app/settings"
              ? { background: ACTIVE_BG, color: CREAM }
              : { color: MUTED }
          }
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all"
          style={{ color: MUTED }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
