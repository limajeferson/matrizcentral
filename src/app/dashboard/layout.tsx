import { Home, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-16 flex-col items-center gap-6 border-r border-border bg-card/70 py-6 backdrop-blur-md">
        <div className="h-8 w-8 rounded-lg bg-violet-600" aria-hidden="true" />
        <nav className="flex flex-1 flex-col items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Home className="h-5 w-5" />
          </span>
        </nav>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground">
          <LogOut className="h-5 w-5" />
        </span>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
