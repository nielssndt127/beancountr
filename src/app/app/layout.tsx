import { AppSidebar } from "@/components/layout/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
