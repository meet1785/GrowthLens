import type { Analysis, Recommendation, ExportFormat } from "@/types";

/**
 * Report generation service.
 * Transforms structured analysis data into readable report formats.
 */

/** Generate a full markdown report from analysis data */
export function generateMarkdownReport(analysis: Analysis): string {
  const {
    url,
    uxAnalysis,
    conversionAnalysis,
    monetizationAnalysis,
    benchmarkAnalysis,
    recommendations,
    executiveSummary,
  } = analysis;

  let md = "";

  // Header
  md += `# GrowthLens Product Analysis Report\n\n`;
  md += `**Website:** ${url}\n`;
  md += `**Generated:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n\n`;
  md += `---\n\n`;

  // Executive Summary
  md += `## Executive Summary\n\n`;
  md += `${executiveSummary || "No executive summary available."}\n\n`;

  // Score Overview
  md += `## Score Overview\n\n`;
  md += `| Category | Score | Grade |\n`;
  md += `|----------|-------|-------|\n`;
  if (uxAnalysis)
    md += `| UX Quality | ${uxAnalysis.overallScore}/100 | ${getLetterGrade(uxAnalysis.overallScore)} |\n`;
  if (conversionAnalysis)
    md += `| Conversion Funnel | ${conversionAnalysis.funnelScore}/100 | ${getLetterGrade(conversionAnalysis.funnelScore)} |\n`;
  if (monetizationAnalysis)
    md += `| Monetization | ${monetizationAnalysis.monetizationScore}/100 | ${getLetterGrade(monetizationAnalysis.monetizationScore)} |\n`;
  if (benchmarkAnalysis)
    md += `| Overall Benchmark | — | ${benchmarkAnalysis.overallGrade} |\n`;
  md += `\n`;

  // UX Findings
  if (uxAnalysis) {
    md += `## UX Analysis\n\n`;
    md += `### Cognitive Load (Score: ${uxAnalysis.cognitiveLoad.score}/100)\n\n`;
    uxAnalysis.cognitiveLoad.factors.forEach((f) => {
      md += `- ${f}\n`;
    });
    md += `\n**Recommendation:** ${uxAnalysis.cognitiveLoad.recommendation}\n\n`;

    md += `### CTA Clarity (Score: ${uxAnalysis.ctaClarity.score}/100)\n\n`;
    md += `Primary CTA found: ${uxAnalysis.ctaClarity.primaryCTAFound ? "Yes" : "No"}\n\n`;
    uxAnalysis.ctaClarity.issues.forEach((issue) => {
      md += `- ${issue}\n`;
    });
    md += `\n**Recommendation:** ${uxAnalysis.ctaClarity.recommendation}\n\n`;

    if (uxAnalysis.frictionPoints.length > 0) {
      md += `### Friction Points\n\n`;
      uxAnalysis.frictionPoints.forEach((fp) => {
        md += `- **[${fp.severity.toUpperCase()}]** ${fp.location}: ${fp.description}\n`;
        md += `  - Fix: ${fp.suggestedFix}\n`;
      });
      md += `\n`;
    }
  }

  // Conversion Analysis
  if (conversionAnalysis) {
    md += `## Conversion Funnel Analysis\n\n`;

    if (conversionAnalysis.dropOffRisks.length > 0) {
      md += `### Drop-off Risks\n\n`;
      conversionAnalysis.dropOffRisks.forEach((risk) => {
        md += `- **${risk.stage}** (${risk.risk} risk): ${risk.reason}\n`;
        md += `  - Mitigation: ${risk.mitigation}\n`;
      });
      md += `\n`;
    }

    md += `### Trust Signals (Score: ${conversionAnalysis.trustSignals.score}/100)\n\n`;
    if (conversionAnalysis.trustSignals.present.length > 0) {
      md += `**Present:** ${conversionAnalysis.trustSignals.present.join(", ")}\n\n`;
    }
    if (conversionAnalysis.trustSignals.missing.length > 0) {
      md += `**Missing:** ${conversionAnalysis.trustSignals.missing.join(", ")}\n\n`;
    }

    if (conversionAnalysis.decisionBlockers.length > 0) {
      md += `### Decision Blockers\n\n`;
      conversionAnalysis.decisionBlockers.forEach((b) => {
        md += `- **[${b.impact.toUpperCase()}]** ${b.description}\n`;
        md += `  - Resolution: ${b.resolution}\n`;
      });
      md += `\n`;
    }
  }

  // Monetization
  if (monetizationAnalysis) {
    md += `## Monetization Analysis\n\n`;
    md += `### Pricing Clarity (Score: ${monetizationAnalysis.pricingClarity.score}/100)\n\n`;
    monetizationAnalysis.pricingClarity.issues.forEach((issue) => {
      md += `- ${issue}\n`;
    });
    md += `\n**Recommendation:** ${monetizationAnalysis.pricingClarity.recommendation}\n\n`;

    md += `### Plan Differentiation (Score: ${monetizationAnalysis.planDifferentiation.score}/100)\n\n`;
    md += `Plans detected: ${monetizationAnalysis.planDifferentiation.planCount}\n\n`;
    monetizationAnalysis.planDifferentiation.issues.forEach((issue) => {
      md += `- ${issue}\n`;
    });
    md += `\n`;

    if (monetizationAnalysis.upsellOpportunities.length > 0) {
      md += `### Upsell Opportunities\n\n`;
      monetizationAnalysis.upsellOpportunities.forEach((opp) => {
        md += `- **${opp.description}** (${opp.expectedImpact} impact)\n`;
        md += `  - Implementation: ${opp.implementation}\n`;
      });
      md += `\n`;
    }
  }

  // Recommendations
  if (recommendations && recommendations.length > 0) {
    md += `## Top Recommendations\n\n`;
    recommendations.forEach((rec) => {
      md += `### ${rec.rank}. ${rec.title}\n\n`;
      md += `**Category:** ${rec.category} | **Impact:** ${rec.expectedImpact} | **Effort:** ${rec.effort} | **ROI Score:** ${rec.roiScore}/10\n\n`;
      md += `**Problem:** ${rec.problem}\n\n`;
      md += `**Why it matters:** ${rec.whyItMatters}\n\n`;
      md += `**What to change:** ${rec.whatToChange}\n\n`;
      if (rec.evidence.length > 0) {
        md += `**Evidence:**\n`;
        rec.evidence.forEach((e) => {
          md += `- ${e}\n`;
        });
      }
      md += `\n---\n\n`;
    });
  }

  // Footer
  md += `\n\n---\n*Report generated by GrowthLens — AI-Powered Product Growth Analyzer*\n`;

  return md;
}

/** Convert numeric score to letter grade */
function getLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
