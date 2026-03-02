"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeftRight } from "lucide-react";

interface ComparableReport {
  id: string;
  domain: string;
  createdAt: string;
  scores: {
    ux: number | null;
    conversion: number | null;
    monetization: number | null;
  };
  grade: string | null;
}

interface ReportsCompareProps {
  reports: ComparableReport[];
}

function scoreDelta(current: number | null, previous: number | null): number | null {
  if (typeof current !== "number" || typeof previous !== "number") return null;
  return current - previous;
}

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) {
    return <Badge variant="default">n/a</Badge>;
  }

  if (value > 0) {
    return <Badge variant="success">+{value}</Badge>;
  }
  if (value < 0) {
    return <Badge variant="error">{value}</Badge>;
  }
  return <Badge variant="info">0</Badge>;
}

export function ReportsCompare({ reports }: ReportsCompareProps) {
  const [leftId, setLeftId] = useState(reports[0]?.id ?? "");
  const [rightId, setRightId] = useState(reports[1]?.id ?? reports[0]?.id ?? "");

  const left = useMemo(() => reports.find((r) => r.id === leftId) ?? null, [reports, leftId]);
  const right = useMemo(() => reports.find((r) => r.id === rightId) ?? null, [reports, rightId]);

  if (reports.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-amber-500" />
          Compare Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={leftId}
            onChange={(event) => setLeftId(event.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]"
          >
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.domain} · {new Date(report.createdAt).toLocaleDateString("en-US")}
              </option>
            ))}
          </select>

          <select
            value={rightId}
            onChange={(event) => setRightId(event.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]"
          >
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.domain} · {new Date(report.createdAt).toLocaleDateString("en-US")}
              </option>
            ))}
          </select>
        </div>

        {left && right && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{left.domain}</p>
              <p className="text-xs text-[var(--text-dim)] font-mono mb-3">
                {new Date(left.createdAt).toLocaleDateString("en-US")}
              </p>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>UX: {left.scores.ux ?? "n/a"}</p>
                <p>Conversion: {left.scores.conversion ?? "n/a"}</p>
                <p>Monetization: {left.scores.monetization ?? "n/a"}</p>
                <p>Benchmark: {left.grade ?? "n/a"}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{right.domain}</p>
              <p className="text-xs text-[var(--text-dim)] font-mono mb-3">
                {new Date(right.createdAt).toLocaleDateString("en-US")}
              </p>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>UX: {right.scores.ux ?? "n/a"}</p>
                <p>Conversion: {right.scores.conversion ?? "n/a"}</p>
                <p>Monetization: {right.scores.monetization ?? "n/a"}</p>
                <p>Benchmark: {right.grade ?? "n/a"}</p>
              </div>
            </div>
          </div>
        )}

        {left && right && (
          <div className="p-4 rounded-xl border border-[var(--border-subtle)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Delta (Right - Left)</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2">
                UX <DeltaBadge value={scoreDelta(right.scores.ux, left.scores.ux)} />
              </span>
              <span className="inline-flex items-center gap-2">
                Conversion <DeltaBadge value={scoreDelta(right.scores.conversion, left.scores.conversion)} />
              </span>
              <span className="inline-flex items-center gap-2">
                Monetization <DeltaBadge value={scoreDelta(right.scores.monetization, left.scores.monetization)} />
              </span>
              <span className="inline-flex items-center gap-2">
                Grade <Badge variant="info">{left.grade ?? "n/a"} → {right.grade ?? "n/a"}</Badge>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}