import connectDB from "@/lib/mongodb";
import Analysis from "@/models/Analysis";
import { notFound } from "next/navigation";
import { SharedAnalysisView } from "./SharedAnalysisView";
import type { Metadata } from "next";
import type {
  UXAnalysis,
  ConversionAnalysis,
  MonetizationAnalysis,
  BenchmarkAnalysis,
  Recommendation,
} from "@/types";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  await connectDB();
  const analysis = await Analysis.findOne({ shareToken: token, status: "completed" })
    .select("domain url")
    .lean();

  if (!analysis) return { title: "Not Found — GrowthLens" };

  return {
    title: `${analysis.domain} Analysis — GrowthLens`,
    description: `AI-powered growth analysis for ${analysis.url}`,
  };
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params;
  await connectDB();

  const analysis = await Analysis.findOne({
    shareToken: token,
    status: "completed",
  })
    .select("url domain executiveSummary uxAnalysis conversionAnalysis monetizationAnalysis benchmarkAnalysis recommendations createdAt")
    .lean();

  if (!analysis) notFound();

  return (
    <SharedAnalysisView
      url={analysis.url}
      domain={analysis.domain}
      executiveSummary={analysis.executiveSummary as string | undefined}
      uxAnalysis={analysis.uxAnalysis as UXAnalysis | undefined}
      conversionAnalysis={analysis.conversionAnalysis as ConversionAnalysis | undefined}
      monetizationAnalysis={analysis.monetizationAnalysis as MonetizationAnalysis | undefined}
      benchmarkAnalysis={analysis.benchmarkAnalysis as BenchmarkAnalysis | undefined}
      recommendations={analysis.recommendations as Recommendation[] | undefined}
      createdAt={analysis.createdAt.toISOString()}
    />
  );
}
