"use client";

import React from "react";
import { Loader2, CheckCircle2, XCircle, Globe } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardContent } from "@/components/ui/Card";

interface AnalysisProgressProps {
  status: string;
  progress: number;
  currentStage: string | null;
  error: string | null;
  url: string;
}

const stageLabels: Record<string, string> = {
  "Starting web crawl...": "▶ Starting web crawl",
  "Crawl complete. Starting AI analysis...": "✓ Crawl complete — starting AI",
  "Analysing UX patterns...": "○ Analysing UX patterns",
  "Evaluating conversion funnel...": "○ Evaluating conversion funnel",
  "Assessing monetization...": "○ Assessing monetization",
  "Benchmarking against best practices...": "○ Benchmarking best practices",
  "Generating recommendations...": "○ Generating recommendations",
  "Writing executive summary...": "○ Writing executive summary",
  "Complete": "✓ Complete",
};

export function AnalysisProgress({
  status,
  progress,
  currentStage,
  error,
  url,
}: AnalysisProgressProps) {
  const isRunning = status === "crawling" || status === "analyzing" || status === "pending";
  const isComplete = status === "completed";
  const isFailed = status === "failed";

  return (
    <Card className="max-w-3xl mx-auto animate-scale-in">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">Mission Status</p>
          {isRunning && (
            <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-[var(--accent-dim)] border border-amber-300/20 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}
          {isComplete && (
            <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          )}
          {isFailed && (
            <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          )}

          <h2 className="text-xl md:text-2xl text-heading text-[var(--text-primary)]">
            {isRunning && "Analyzing..."}
            {isComplete && "Analysis Complete!"}
            {isFailed && "Analysis Failed"}
          </h2>

          <div className="flex items-center gap-1.5 mt-2 text-sm text-[var(--text-muted)] font-mono">
            <Globe size={14} />
            <span>{url}</span>
          </div>
        </div>

        {isRunning && (
          <>
            <ProgressBar
              value={progress}
              size="lg"
              className="mb-4"
            />
            {currentStage && (
              <div className="text-sm text-[var(--text-secondary)] font-mono">
                {stageLabels[currentStage] ?? `○ ${currentStage}`}
              </div>
            )}
          </>
        )}

        {isFailed && error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
