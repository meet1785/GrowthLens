"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  FileText,
  Crosshair,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

const navigation = [
  {
    name: "Overview",
    hint: "Active analyses",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "New Analysis",
    hint: "Run a fresh audit",
    href: "/analysis/new",
    icon: Crosshair,
  },
  {
    name: "Reports",
    hint: "Review outcomes",
    href: "/reports",
    icon: FileText,
  },
];

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-[var(--radius-sm)] app-surface text-[var(--text-secondary)]"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-[var(--bg-deep)]/90 backdrop-blur border-r border-[var(--border-subtle)] flex flex-col transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-5 border-b border-[var(--border-subtle)]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent-dim)] border border-amber-300/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[var(--text-primary)] leading-none block">
                Growth<span className="text-amber-400">Lens</span>
              </span>
              <span className="text-xs text-[var(--text-dim)] font-mono">Decision Workspace</span>
            </div>
          </Link>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono px-2">
            Mission
          </p>
        </div>

        <nav className="flex-1 px-4 py-1 space-y-1.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] border transition-colors",
                  isActive
                    ? "bg-[var(--accent-dim)] text-[var(--text-primary)] border-amber-300/25"
                    : "bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0",
                    isActive
                      ? "border-amber-300/25 bg-amber-200/10 text-amber-300"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-dim)]"
                  )}
                >
                  <item.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none">{item.name}</p>
                  <p className="text-xs text-[var(--text-dim)] mt-1 truncate">{item.hint}</p>
                </div>
                <ChevronRight
                  size={14}
                  className={cn(
                    "shrink-0 transition-opacity",
                    isActive ? "opacity-100 text-amber-300" : "opacity-0 group-hover:opacity-70"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
          <div className="app-surface p-3 rounded-[var(--radius-sm)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-dim)] border border-amber-300/20 flex items-center justify-center text-sm font-semibold text-amber-300">
                {userName?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {userName ?? "User"}
                </p>
                <p className="text-xs text-[var(--text-dim)] truncate font-mono">
                  {userEmail ?? ""}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors w-full border border-transparent hover:border-[var(--border-subtle)]"
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </aside>
    </>
  );
}
