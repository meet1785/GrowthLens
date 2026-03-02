"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  Globe,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  const completedCount = analyses.filter((a) => a.status === "completed").length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back, <span className="text-amber-500">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1 font-mono">
            {completedCount} analysis{completedCount !== 1 ? "es" : ""} completed
          </p>
        </div>
        <Link href="/analysis/new">
          <Button variant="primary">
            <Plus size={16} />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {analyses.length === 0 && (
        <Card className="animate-scale-in delay-1">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Crosshair className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No analyses yet
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm mx-auto">
              Start your first product analysis by entering a website URL. You&apos;ll
              get a comprehensive growth report in minutes.
            </p>
            <Link href="/analysis/new">
              <Button variant="primary">
                <Plus size={16} />
                Start First Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Analysis list */}
      {analyses.length > 0 && (
        <Card className="animate-scale-in delay-1">
          <CardHeader>
            <CardTitle>Your Analyses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border-subtle)]">
              {analyses.map((analysis) => {
                const status = statusConfig[analysis.status] ?? statusConfig.pending;
                return (
                  <button
                    key={analysis._id}
                    onClick={() => router.push(`/analysis/${analysis._id}`)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Globe size={18} className="text-[var(--text-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {analysis.domain}
                      </p>
                      <p className="text-xs text-[var(--text-dim)] mt-0.5 font-mono">
                        {formatDate(analysis.createdAt)}
                        {analysis.duration &&
                          ` · ${Math.round(analysis.duration / 1000)}s`}
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
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
