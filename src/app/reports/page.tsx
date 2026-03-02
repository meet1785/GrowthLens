import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  FileText,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReportsCompare } from "@/components/reports/ReportsCompare";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  await connectDB();

  const completedAnalyses = await Analysis.find({
    userId: session.user.id,
    status: "completed",
  })
    .select("url domain createdAt duration uxAnalysis.overallScore conversionAnalysis.funnelScore monetizationAnalysis.monetizationScore benchmarkAnalysis.overallGrade")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const avgUx =
    completedAnalyses.length > 0
      ? Math.round(
          completedAnalyses.reduce(
            (acc, item) => acc + (item.uxAnalysis?.overallScore ?? 0),
            0
          ) / completedAnalyses.length
        )
      : null;

  const comparableReports = completedAnalyses.map((analysis) => ({
    id: analysis._id.toString(),
    domain: analysis.domain,
    createdAt: new Date(analysis.createdAt).toISOString(),
    scores: {
      ux: analysis.uxAnalysis?.overallScore ?? null,
      conversion: analysis.conversionAnalysis?.funnelScore ?? null,
      monetization: analysis.monetizationAnalysis?.monetizationScore ?? null,
    },
    grade: analysis.benchmarkAnalysis?.overallGrade ?? null,
  }));

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">
          Reports
        </p>
        <h1 className="text-heading text-2xl md:text-3xl text-[var(--text-primary)]">Decision Reports</h1>
        <p className="text-[var(--text-muted)] text-sm mt-2">
          Review completed analyses, compare outcomes, and export findings.
        </p>
      </div>

      <section className="app-surface-strong p-4 md:p-5">
        <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] mb-4">
          <Image
            src="/illustrations/reports-wave.svg"
            alt="Trend wave chart illustration"
            width={720}
            height={260}
            className="w-full h-32 object-cover animate-float-soft"
          />
        </div>
        <div className="metric-strip">
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-mono">Completed</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-2">{completedAnalyses.length}</p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-mono">Average UX</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-2">{avgUx ?? "—"}</p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-mono">Top Grade</p>
            <p className="text-2xl font-semibold text-[var(--text-primary)] mt-2">
              {completedAnalyses[0]?.benchmarkAnalysis?.overallGrade ?? "—"}
            </p>
          </div>
          <div className="metric-block hover-lift">
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wide font-mono">Compare</p>
            <p className="text-sm font-medium text-[var(--text-primary)] mt-2">{completedAnalyses.length >= 2 ? "Ready" : "Need 2 reports"}</p>
          </div>
        </div>
      </section>

      {completedAnalyses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No reports yet
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Complete your first analysis to generate a report.
            </p>
            <Link
              href="/analysis/new"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#191105] font-medium px-4 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--accent-light)] transition-colors text-sm"
            >
              Start Analysis
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <ReportsCompare reports={comparableReports} />

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-300" />
                Completed Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border-subtle)]">
                {completedAnalyses.map((analysis) => {
                  const id = analysis._id.toString();
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] hover:translate-x-0.5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-emerald-500/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {analysis.domain}
                        </p>
                        <p className="text-xs text-[var(--text-dim)] mt-0.5 font-mono">
                          {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      {analysis.benchmarkAnalysis?.overallGrade && (
                        <Badge variant="info" size="sm">
                          Grade: {analysis.benchmarkAnalysis.overallGrade}
                        </Badge>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/analysis/${id}`}
                          className="text-sm text-[var(--info)] hover:text-blue-300 font-medium flex items-center gap-1"
                        >
                          View <ArrowRight size={14} />
                        </Link>
                        <a
                          href={`/api/reports/${id}?format=markdown`}
                          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
                          download
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
