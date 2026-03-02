"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnalysisProgress } from "@/components/analysis/AnalysisProgress";
import { AnalysisResults } from "@/components/analysis/AnalysisResults";
import { useAnalysisPolling } from "@/hooks/usePolling";
import { toast } from "@/stores/toast";
import Link from "next/link";

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const { status, progress, currentStage, error, isComplete } =
    useAnalysisPolling(id, {
      enabled: !analysis || (analysis.status !== "completed" && analysis.status !== "failed"),
    });

  // Fetch full analysis data
  const fetchAnalysis = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Refetch when complete
  useEffect(() => {
    if (isComplete) {
      fetchAnalysis();
    }
  }, [isComplete, fetchAnalysis]);

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

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const res = await fetch(`/api/analysis/${id}/share`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const url = data.data.shareUrl;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
      } else {
        toast.error(data.error || "Failed to generate share link");
      }
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="app-surface p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Overview
          </button>
          <h1 className="text-heading text-xl md:text-2xl mt-2 text-[var(--text-primary)]">
            Analysis Workspace
          </h1>
        </div>

        {isDone && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={shareLoading}
            >
              {shareUrl ? <Check size={14} /> : <Share2 size={14} />}
              {shareUrl ? "Copied!" : "Share"}
            </Button>
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
          url={(analysis.url as string) || ""}
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
