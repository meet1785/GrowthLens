"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  Globe,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreTrends } from "@/components/dashboard/ScoreTrends";
import { formatDate } from "@/lib/utils";

interface AnalysisSummary {
  _id: string;
  url: string;
  domain: string;
  status: string;
  progress: number;
  currentStage: string | null;
  createdAt: string;
  duration: number | null;
}

interface DashboardClientProps {
  userName: string;
  analyses: AnalysisSummary[];
}

const statusConfig: Record<
  string,
  { icon: React.ReactNode; variant: "default" | "success" | "warning" | "error" | "info"; label: string }
> = {
  pending: { icon: <Clock size={14} />, variant: "default", label: "Pending" },
  crawling: { icon: <Loader2 size={14} className="animate-spin" />, variant: "info", label: "Crawling" },
  analyzing: { icon: <Loader2 size={14} className="animate-spin" />, variant: "info", label: "Analyzing" },
  completed: { icon: <CheckCircle2 size={14} />, variant: "success", label: "Complete" },
  failed: { icon: <XCircle size={14} />, variant: "error", label: "Failed" },
};

export function DashboardClient({ userName, analyses }: DashboardClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "domain">("newest");

  const completedCount = analyses.filter((a) => a.status === "completed").length;
  const runningCount = analyses.filter(
    (a) => a.status === "pending" || a.status === "crawling" || a.status === "analyzing"
  ).length;
  const failedCount = analyses.filter((a) => a.status === "failed").length;
  const newest = analyses[0];

  const filteredAnalyses = useMemo(() => {
    let result = [...analyses];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.domain.toLowerCase().includes(q) || a.url.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      if (statusFilter === "running") {
        result = result.filter((a) => ["pending", "crawling", "analyzing"].includes(a.status));
      } else {
        result = result.filter((a) => a.status === statusFilter);
      }
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "domain") {
      result.sort((a, b) => a.domain.localeCompare(b.domain));
    }

    return result;
  }, [analyses, searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">
            Overview
          </p>
          <h1 className="text-2xl md:text-3xl text-heading text-[var(--text-primary)]">
            Focus for today, <span className="text-amber-300">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-2">
            Run audits, monitor progress, and act on the highest-impact fixes.
          </p>
        </div>
        <Link href="/analysis/new">
          <Button variant="primary" size="lg">
            <Plus size={16} />
            New Analysis
          </Button>
        </Link>
      </div>

      <section className="app-surface-strong p-4 md:p-5">
        <div className="metric-strip">
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] font-mono uppercase tracking-wide">Completed</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{completedCount}</p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] font-mono uppercase tracking-wide">In Progress</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{runningCount}</p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] font-mono uppercase tracking-wide">Needs Review</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{failedCount}</p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] font-mono uppercase tracking-wide">Last Domain</p>
            <p className="mt-2 text-sm md:text-base font-medium text-[var(--text-primary)] truncate">
              {newest?.domain ?? "No analyses yet"}
            </p>
          </div>
        </div>
      </section>

      {analyses.length === 0 ? (
        <Card className="animate-scale-in delay-1">
          <CardContent className="py-14 text-center">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No analyses yet
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm mx-auto">
              Start your first audit and GrowthLens will build a prioritized decision report.
            </p>
            <Link href="/analysis/new">
              <Button variant="primary">
                <Plus size={16} />
                Start First Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
          <Card className="xl:col-span-2 hover-lift">
            <CardHeader>
              <CardTitle>Active Analysis Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Search, Filter & Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search domains..."
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 pl-8 pr-6 text-xs rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="running">In Progress</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div className="relative">
                    <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="h-9 pl-8 pr-6 text-xs rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] appearance-none cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="domain">A-Z Domain</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              {(searchQuery || statusFilter !== "all") && (
                <p className="text-xs text-[var(--text-dim)] font-mono">
                  {filteredAnalyses.length} of {analyses.length} analyses
                </p>
              )}
            </CardContent>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border-subtle)]">
                {filteredAnalyses.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">No analyses match your filters</p>
                  </div>
                ) : (
                  filteredAnalyses.slice(0, 12).map((analysis) => {
                  const status = statusConfig[analysis.status] ?? statusConfig.pending;
                  return (
                    <button
                      key={analysis._id}
                      onClick={() => router.push(`/analysis/${analysis._id}`)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] hover:translate-x-0.5 transition-all text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                        <Globe size={18} className="text-[var(--text-muted)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {analysis.domain}
                        </p>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5 font-mono">
                          {formatDate(analysis.createdAt)}
                          {analysis.duration ? ` · ${Math.round(analysis.duration / 1000)}s` : ""}
                        </p>
                      </div>
                      <Badge variant={status.variant} size="sm">
                        <span className="flex items-center gap-1">
                          {status.icon}
                          {status.label}
                        </span>
                      </Badge>
                      <ArrowRight size={16} className="text-[var(--text-dim)] shrink-0" />
                    </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Decision Backlog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] mb-2">
                <Image
                  src="/illustrations/growth-orbit.svg"
                  alt="Growth dashboard visualization"
                  width={720}
                  height={520}
                  className="w-full h-28 object-cover animate-tilt"
                />
              </div>
              <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">Fix highest-risk flows</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Review analyses with failed or low-scoring funnel results first.</p>
              </div>
              <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">Export latest report</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Share completed recommendations with your team this week.</p>
              </div>
              <div className="p-3 rounded-[var(--radius-sm)] border border-amber-300/20 bg-[var(--accent-dim)] text-amber-100">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Keep at least one active analysis
                </p>
                <p className="text-xs mt-1 text-amber-200/90">Continuous scans improve trend visibility and decision quality.</p>
              </div>
            </CardContent>
          </Card>

          {/* Score Trend Sparklines */}
          <div className="xl:col-span-3">
            <ScoreTrends />
          </div>
        </div>
      )}
    </div>
  );
}
