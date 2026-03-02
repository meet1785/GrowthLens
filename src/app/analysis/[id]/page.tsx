"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnalysisProgress } from "@/components/analysis/AnalysisProgress";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { useAnalysisPolling } from "@/hooks/usePolling";
import Link from "next/link";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const { status, progress, currentStage, error, isComplete } =
    useAnalysisPolling(id, {
      enabled: !analysis || (analysis.status !== "completed" && analysis.status !== "failed"),
    });

  // Fetch full analysis data
  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/analysis/${id}`);
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch {
      // retry silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  // Refetch when complete
  useEffect(() => {
    if (isComplete) {
      fetchAnalysis();
    }
  }, [isComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-32">
        <p className="text-[var(--text-muted)]">Analysis not found.</p>
        <Link href="/dashboard" className="text-amber-500 text-sm mt-2 inline-block hover:text-amber-400">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentStatus = (analysis.status as string) || status;
  const isRunning =
    currentStatus === "pending" ||
    currentStatus === "crawling" ||
    currentStatus === "analyzing";
  const isDone = currentStatus === "completed";

  const handleExport = async (format: string) => {
    window.open(`/api/reports/${id}?format=${format}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {isDone && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("markdown")}
            >
              <Download size={14} />
              Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
            >
              <FileText size={14} />
              JSON
            </Button>
          </div>
        )}
      </div>

      {/* Progress / Results */}
      {isRunning && (
        <AnalysisProgress
          status={status || currentStatus}
          progress={progress || (analysis.progress as number) || 0}
          currentStage={currentStage || (analysis.currentStage as string) || null}
          error={error || (analysis.error as string) || null}
          url={(analysis.url as string) || ""}
        />
      )}

      {currentStatus === "failed" && (
        <AnalysisProgress
          status="failed"
          progress={0}
          currentStage={null}
          error={(analysis.error as string) || "Analysis failed"}
          url={(analysis.url as string) || ""}
        />
      )}

      {isDone && (
        <AnalysisResults
          executiveSummary={analysis.executiveSummary as string}
          uxAnalysis={analysis.uxAnalysis as AnalysisResults["uxAnalysis"]}
          conversionAnalysis={analysis.conversionAnalysis as AnalysisResults["conversionAnalysis"]}
          monetizationAnalysis={analysis.monetizationAnalysis as AnalysisResults["monetizationAnalysis"]}
          benchmarkAnalysis={analysis.benchmarkAnalysis as AnalysisResults["benchmarkAnalysis"]}
          recommendations={analysis.recommendations as AnalysisResults["recommendations"]}
          domain={(analysis.domain as string) || ""}
        />
      )}
    </div>
  );
}

// Type helper for the component props
type AnalysisResults = {
  uxAnalysis: import("@/types").UXAnalysis | undefined;
  conversionAnalysis: import("@/types").ConversionAnalysis | undefined;
  monetizationAnalysis: import("@/types").MonetizationAnalysis | undefined;
  benchmarkAnalysis: import("@/types").BenchmarkAnalysis | undefined;
  recommendations: import("@/types").Recommendation[] | undefined;
};
