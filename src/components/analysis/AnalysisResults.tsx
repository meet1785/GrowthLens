"use client";

import React from "react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getGradeColor } from "@/lib/utils";
import { downloadPDFReport } from "@/services/pdf-generator";
import { toast } from "@/stores/toast";
import type {
  Analysis,
  UXAnalysis,
  ConversionAnalysis,
  MonetizationAnalysis,
  BenchmarkAnalysis,
  Recommendation,
} from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Target,
  Award,
  Download,
  FileText,
} from "lucide-react";

interface AnalysisResultsProps {
  executiveSummary?: string;
  uxAnalysis?: UXAnalysis;
  conversionAnalysis?: ConversionAnalysis;
  monetizationAnalysis?: MonetizationAnalysis;
  benchmarkAnalysis?: BenchmarkAnalysis;
  recommendations?: Recommendation[];
  domain: string;
  url: string;
}

export function AnalysisResults({
  executiveSummary,
  uxAnalysis,
  conversionAnalysis,
  monetizationAnalysis,
  benchmarkAnalysis,
  recommendations,
  domain,
  url,
}: AnalysisResultsProps) {
  const handleDownloadPDF = () => {
    try {
      const analysisData: Analysis = {
        _id: "",
        userId: "",
        url,
        status: "completed",
        progress: 100,
        executiveSummary,
        uxAnalysis,
        conversionAnalysis,
        monetizationAnalysis,
        benchmarkAnalysis,
        recommendations,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      downloadPDFReport(analysisData);
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadMD = async () => {
    try {
      const res = await fetch(`/api/reports/${domain}?format=markdown`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `growthlens-${domain}.md`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Markdown report downloaded");
    } catch {
      toast.error("Failed to download markdown report");
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Export Actions */}
      <div className="flex items-center gap-3 justify-end">
        <Button variant="ghost" size="sm" onClick={handleDownloadMD}>
          <FileText size={15} />
          Export .md
        </Button>
        <Button variant="primary" size="sm" onClick={handleDownloadPDF}>
          <Download size={15} />
          Export PDF
        </Button>
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Score Overview — <span className="text-amber-500">{domain}</span></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
            {uxAnalysis && (
              <ScoreRing score={uxAnalysis.overallScore} label="UX Quality" />
            )}
            {conversionAnalysis && (
              <ScoreRing
                score={conversionAnalysis.funnelScore}
                label="Conversion"
              />
            )}
            {monetizationAnalysis && (
              <ScoreRing
                score={monetizationAnalysis.monetizationScore}
                label="Monetization"
              />
            )}
            {benchmarkAnalysis && (
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center ${getGradeColor(benchmarkAnalysis.overallGrade)}`}
                >
                  <span className="text-4xl font-bold font-mono">
                    {benchmarkAnalysis.overallGrade}
                  </span>
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Benchmark Grade
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Top Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" />
              Top Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.slice(0, 5).map((rec, i) => (
              <div
                key={i}
                className="border border-[var(--border-subtle)] rounded-xl p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-[var(--text-primary)]">
                    {rec.rank}. {rec.title}
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        rec.expectedImpact === "critical"
                          ? "error"
                          : rec.expectedImpact === "high"
                            ? "warning"
                            : rec.expectedImpact === "medium"
                              ? "info"
                              : "default"
                      }
                    >
                      {rec.expectedImpact} impact
                    </Badge>
                    <Badge variant="default">{rec.effort} effort</Badge>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  <strong className="text-[var(--text-secondary)]">Problem:</strong> {rec.problem}
                </p>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  <strong className="text-[var(--text-secondary)]">Why it matters:</strong> {rec.whyItMatters}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <strong>What to change:</strong> {rec.whatToChange}
                </p>
                {rec.evidence.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                    <p className="text-xs font-medium text-[var(--text-dim)] mb-1 font-mono">
                      Evidence:
                    </p>
                    <ul className="text-xs text-[var(--text-dim)] space-y-0.5">
                      {rec.evidence.map((e, j) => (
                        <li key={j}>• {e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* UX Analysis */}
      {uxAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={18} className="text-cyan-400" />
              UX Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Cognitive Load <span className="font-mono text-amber-500">({uxAnalysis.cognitiveLoad.score}/100)</span>
                </h4>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  {uxAnalysis.cognitiveLoad.factors.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                <p className="text-sm text-cyan-400 mt-2 font-medium">
                  {uxAnalysis.cognitiveLoad.recommendation}
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  CTA Clarity <span className="font-mono text-amber-500">({uxAnalysis.ctaClarity.score}/100)</span>
                </h4>
                <p className="text-sm text-[var(--text-muted)] mb-1">
                  Primary CTA: {uxAnalysis.ctaClarity.primaryCTAFound ? (
                    <span className="text-emerald-400">✓ Found</span>
                  ) : (
                    <span className="text-red-400">✗ Not found</span>
                  )}
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  {uxAnalysis.ctaClarity.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            </div>

            {uxAnalysis.frictionPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  Friction Points
                </h4>
                <div className="space-y-2">
                  {uxAnalysis.frictionPoints.map((fp, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-subtle)]"
                    >
                      {fp.severity === "critical" || fp.severity === "high" ? (
                        <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                      ) : fp.severity === "medium" ? (
                        <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {fp.location}
                          </span>
                          <Badge
                            variant={
                              fp.severity === "critical"
                                ? "error"
                                : fp.severity === "high"
                                  ? "warning"
                                  : fp.severity === "medium"
                                    ? "info"
                                    : "success"
                            }
                            size="sm"
                          >
                            {fp.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {fp.description}
                        </p>
                        <p className="text-sm text-cyan-400 mt-1">
                          Fix: {fp.suggestedFix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversion Analysis */}
      {conversionAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Conversion Funnel Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {conversionAnalysis.dropOffRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  Drop-off Risks
                </h4>
                <div className="space-y-2">
                  {conversionAnalysis.dropOffRisks.map((risk, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-subtle)]"
                    >
                      <Badge
                        variant={
                          risk.risk === "high"
                            ? "error"
                            : risk.risk === "medium"
                              ? "warning"
                              : "success"
                        }
                      >
                        {risk.risk}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {risk.stage}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">{risk.reason}</p>
                        <p className="text-sm text-cyan-400 mt-1">
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Trust Signals <span className="font-mono text-amber-500">({conversionAnalysis.trustSignals.score}/100)</span>
              </h4>
              {conversionAnalysis.trustSignals.present.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-emerald-400 font-mono">
                    Present:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {conversionAnalysis.trustSignals.present.map((s, i) => (
                      <Badge key={i} variant="success" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {conversionAnalysis.trustSignals.missing.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-red-400 font-mono">
                    Missing:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {conversionAnalysis.trustSignals.missing.map((s, i) => (
                      <Badge key={i} variant="error" size="sm">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monetization Analysis */}
      {monetizationAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-400" />
              Monetization Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Pricing Clarity <span className="font-mono text-amber-500">({monetizationAnalysis.pricingClarity.score}/100)</span>
                </h4>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  {monetizationAnalysis.pricingClarity.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Plan Differentiation <span className="font-mono text-amber-500">({monetizationAnalysis.planDifferentiation.score}/100)</span>
                </h4>
                <p className="text-sm text-[var(--text-muted)] mb-1 font-mono">
                  Plans detected: {monetizationAnalysis.planDifferentiation.planCount}
                </p>
                <ul className="text-sm text-[var(--text-muted)] space-y-1">
                  {monetizationAnalysis.planDifferentiation.issues.map(
                    (issue, i) => (
                      <li key={i}>• {issue}</li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {monetizationAnalysis.upsellOpportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  Upsell Opportunities
                </h4>
                <div className="space-y-2">
                  {monetizationAnalysis.upsellOpportunities.map((opp, i) => (
                    <div
                      key={i}
                      className="p-3 border border-[var(--border-subtle)] rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {opp.description}
                        </p>
                        <Badge
                          variant={
                            opp.expectedImpact === "high"
                              ? "warning"
                              : opp.expectedImpact === "medium"
                                ? "info"
                                : "default"
                          }
                          size="sm"
                        >
                          {opp.expectedImpact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        {opp.implementation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benchmark Analysis */}
      {benchmarkAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">⚡</span> Benchmark Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benchmarkAnalysis.categoryGrades.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {benchmarkAnalysis.categoryGrades.map((cg, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-[var(--border-subtle)] text-center bg-[var(--bg-elevated)]"
                  >
                    <span
                      className={`text-2xl font-bold font-mono inline-block mb-1 px-3 py-1 rounded-lg ${getGradeColor(cg.grade)}`}
                    >
                      {cg.grade}
                    </span>
                    <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">
                      {cg.category}
                    </p>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5">
                      {cg.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {benchmarkAnalysis.strengths.length > 0 && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">
                  Strengths
                </h4>
                <ul className="text-sm text-emerald-300/80 space-y-1">
                  {benchmarkAnalysis.strengths.map((s, i) => (
                    <li key={i}>✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {benchmarkAnalysis.gaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                  Gaps to Address
                </h4>
                <div className="space-y-2">
                  {benchmarkAnalysis.gaps.map((gap, i) => (
                    <div
                      key={i}
                      className="p-3 border border-[var(--border-subtle)] rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {gap.area}
                        </span>
                        <Badge
                          variant={
                            gap.priority === "high"
                              ? "error"
                              : gap.priority === "medium"
                                ? "warning"
                                : "default"
                          }
                          size="sm"
                        >
                          {gap.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        <span className="text-red-400">Current:</span>{" "}
                        {gap.currentState}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        <span className="text-emerald-400">Best practice:</span>{" "}
                        {gap.bestPractice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
