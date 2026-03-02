import { Sidebar } from "@/components/layout/Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
}

export function AppShell({ children, userName, userEmail }: AppShellProps) {
  return (
    <div className="min-h-screen app-shell-bg bg-grid text-[var(--text-primary)]">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="lg:pl-72">
        <div className="app-page">{children}</div>
      </main>
    </div>
  );
}
