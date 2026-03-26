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
    <aside className="w-60 bg-white border-r border-stone-100 flex flex-col min-h-screen sticky top-0">
      {/* Wordmark */}
      <div className="px-4 py-3 border-b border-stone-100">
        <Link href="/app/dashboard" className="flex items-center">
          <img src="/Wordmark.png" alt="Beancountr" style={{ width: "300px", height: "92px", objectFit: "contain" }} />
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              )}
              style={
                active
                  ? { background: "oklch(0.72 0.22 48)" }
                  : undefined
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-100 space-y-0.5">
        <Link
          href="/app/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/app/settings"
              ? "text-white"
              : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
          )}
          style={
            pathname === "/app/settings"
              ? { background: "oklch(0.72 0.22 48)" }
              : undefined
          }
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-50 hover:text-stone-700 w-full transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
