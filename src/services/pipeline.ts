import connectDB from "@/lib/mongodb";
import Analysis, { IAnalysis } from "@/models/Analysis";
import { WebCrawler } from "@/services/crawler";
import {
  analyzeUX,
  analyzeConversion,
  analyzeMonetization,
  analyzeBenchmarks,
  generateRecommendations,
  generateExecutiveSummary,
} from "@/services/analyzer";

/**
 * Orchestrates the full analysis pipeline.
 *
 * Runs sequentially through stages, updating MongoDB progress after each.
 * Each stage is independent — if one fails we still save partial results.
 *
 * In production, this should run in a background worker (BullMQ / serverless function).
 * For MVP, we run it in a long-running API route with streaming progress.
 */
export async function runAnalysisPipeline(analysisId: string): Promise<void> {
  await connectDB();

  const analysis = await Analysis.findById(analysisId);
  if (!analysis) throw new Error(`Analysis ${analysisId} not found`);

  const startTime = Date.now();

  try {
    // ── Stage 1: Crawl ──────────────────────────────────────────────────
    await updateProgress(analysis, "crawling", 5, "Starting web crawl...");
    const crawler = new WebCrawler(analysis.url);
    const crawlData = await crawler.crawl();

    if (crawlData.pages.length === 0) {
      throw new Error(
        "Could not crawl any pages. The website may be unreachable or blocking bots."
      );
    }

    analysis.crawlData = crawlData;
    await updateProgress(analysis, "analyzing", 20, "Crawl complete. Starting AI analysis...");

    // ── Stage 2: UX Analysis ────────────────────────────────────────────
    await updateProgress(analysis, "analyzing", 30, "Analysing UX patterns...");
    try {
      analysis.uxAnalysis = await analyzeUX(crawlData);
    } catch (err) {
      console.error("UX analysis failed:", err);
      analysis.uxAnalysis = getDefaultUXAnalysis();
    }
    await analysis.save();

    // ── Stage 3: Conversion Analysis ────────────────────────────────────
    await updateProgress(analysis, "analyzing", 45, "Evaluating conversion funnel...");
    try {
      analysis.conversionAnalysis = await analyzeConversion(crawlData);
    } catch (err) {
      console.error("Conversion analysis failed:", err);
      analysis.conversionAnalysis = getDefaultConversionAnalysis();
    }
    await analysis.save();

    // ── Stage 4: Monetization Analysis ──────────────────────────────────
    await updateProgress(analysis, "analyzing", 60, "Assessing monetization...");
    try {
      analysis.monetizationAnalysis = await analyzeMonetization(crawlData);
    } catch (err) {
      console.error("Monetization analysis failed:", err);
      analysis.monetizationAnalysis = getDefaultMonetizationAnalysis();
    }
    await analysis.save();

    // ── Stage 5: Benchmark ──────────────────────────────────────────────
    await updateProgress(analysis, "analyzing", 72, "Benchmarking against best practices...");
    try {
      analysis.benchmarkAnalysis = await analyzeBenchmarks(crawlData);
    } catch (err) {
      console.error("Benchmark analysis failed:", err);
      analysis.benchmarkAnalysis = getDefaultBenchmarkAnalysis();
    }
    await analysis.save();

    // ── Stage 6: Recommendations ────────────────────────────────────────
    await updateProgress(analysis, "analyzing", 85, "Generating recommendations...");
    try {
      analysis.recommendations = await generateRecommendations(
        crawlData,
        analysis.uxAnalysis!,
        analysis.conversionAnalysis!,
        analysis.monetizationAnalysis!,
        analysis.benchmarkAnalysis!
      );
    } catch (err) {
      console.error("Recommendations generation failed:", err);
      analysis.recommendations = [];
    }
    await analysis.save();

    // ── Stage 7: Executive Summary ──────────────────────────────────────
    await updateProgress(analysis, "analyzing", 93, "Writing executive summary...");
    try {
      analysis.executiveSummary = await generateExecutiveSummary(
        crawlData,
        analysis.uxAnalysis!,
        analysis.conversionAnalysis!,
        analysis.monetizationAnalysis!,
        analysis.benchmarkAnalysis!,
        analysis.recommendations ?? []
      );
    } catch (err) {
      console.error("Executive summary generation failed:", err);
      analysis.executiveSummary = "Executive summary generation failed. Please review individual analysis sections.";
    }

    // ── Done ────────────────────────────────────────────────────────────
    analysis.status = "completed";
    analysis.progress = 100;
    analysis.currentStage = "Complete";
    analysis.duration = Date.now() - startTime;
    await analysis.save();
  } catch (err) {
    analysis.status = "failed";
    analysis.error =
      err instanceof Error ? err.message : "An unknown error occurred";
    analysis.duration = Date.now() - startTime;
    await analysis.save();
    throw err;
  }
}

/** Helper: update progress in DB */
async function updateProgress(
  analysis: IAnalysis,
  status: IAnalysis["status"],
  progress: number,
  stage: string
) {
  analysis.status = status;
  analysis.progress = progress;
  analysis.currentStage = stage;
  await analysis.save();
}

// ─── Fallback defaults for resilience ───────────────────────────────────────

function getDefaultUXAnalysis() {
  return {
    cognitiveLoad: { score: 50, factors: ["Analysis unavailable"], recommendation: "Manual review recommended" },
    ctaClarity: { score: 50, primaryCTAFound: false, issues: ["Analysis unavailable"], recommendation: "Manual review recommended" },
    frictionPoints: [],
    overallScore: 50,
    evidence: ["AI analysis was unable to complete for this section"],
  };
}

function getDefaultConversionAnalysis() {
  return {
    dropOffRisks: [],
    trustSignals: { score: 50, present: [], missing: ["Analysis unavailable"], recommendation: "Manual review recommended" },
    decisionBlockers: [],
    funnelScore: 50,
    evidence: ["AI analysis was unable to complete for this section"],
  };
}

function getDefaultMonetizationAnalysis() {
  return {
    pricingClarity: { score: 50, issues: ["Analysis unavailable"], recommendation: "Manual review recommended" },
    planDifferentiation: { score: 50, planCount: 0, issues: ["Analysis unavailable"], recommendation: "Manual review recommended" },
    upsellOpportunities: [],
    monetizationScore: 50,
    evidence: ["AI analysis was unable to complete for this section"],
  };
}

function getDefaultBenchmarkAnalysis() {
  return {
    overallGrade: "C" as const,
    categoryGrades: [],
    gaps: [],
    strengths: ["Analysis unavailable — manual review recommended"],
  };
}
