import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#F5F1E8" }}>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* pt-14 = space for mobile top bar (56px); pb-16 = space for mobile bottom tab bar (60px) */}
        <div className="flex-1 p-4 pt-[72px] pb-[76px] md:p-8 md:pt-8 md:pb-8">{children}</div>
      </main>
    </div>
  );
}
