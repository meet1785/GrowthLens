"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { TrendingUp, Loader2 } from "lucide-react";

interface TrendData {
  dates: string[];
  ux: number[];
  conversion: number[];
  monetization: number[];
}

export function ScoreTrends() {
  const [trends, setTrends] = useState<Record<string, TrendData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis/trends")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTrends(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Only show domains with 2+ data points
  const trendDomains = trends
    ? Object.entries(trends).filter(([, v]) => v.ux.length >= 2)
    : [];

  if (loading) {
    return (
      <Card className="hover-lift">
        <CardContent className="py-10 text-center">
          <Loader2 size={18} className="animate-spin mx-auto text-[var(--text-dim)]" />
        </CardContent>
      </Card>
    );
  }

  if (trendDomains.length === 0) return null;

  return (
    <Card className="hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-400" />
          Score Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendDomains.map(([domain, data]) => (
          <div key={domain} className="p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <p className="text-xs font-semibold text-[var(--text-primary)] mb-2 truncate">
              {domain}
            </p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-[var(--text-dim)] w-14 shrink-0 font-mono">UX</span>
                <Sparkline data={data.ux} width={90} height={24} color="rgb(52,211,153)" label={`${domain} UX`} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-[var(--text-dim)] w-14 shrink-0 font-mono">Convert</span>
                <Sparkline data={data.conversion} width={90} height={24} color="rgb(96,165,250)" label={`${domain} Conversion`} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-[var(--text-dim)] w-14 shrink-0 font-mono">Revenue</span>
                <Sparkline data={data.monetization} width={90} height={24} color="rgb(251,191,36)" label={`${domain} Monetization`} />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-dim)] mt-2 font-mono">
              {data.ux.length} analyses tracked
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
