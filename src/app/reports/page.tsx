import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Download,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">
          View and export your completed analysis reports
        </p>
      </div>

      {completedAnalyses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No reports yet
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Complete your first analysis to generate a report.
            </p>
            <Link
              href="/analysis/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Start Analysis
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Completed Analyses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {completedAnalyses.map((analysis) => {
                const id = analysis._id.toString();
                return (
                  <div
                    key={id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {analysis.domain}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
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
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        View <ArrowRight size={14} />
                      </Link>
                      <a
                        href={`/api/reports/${id}?format=markdown`}
                        className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
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
      )}
    </div>
  );
}
