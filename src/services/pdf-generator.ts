"use client";

import { jsPDF } from "jspdf";
import type { Analysis } from "@/types";

/**
 * Generate a branded PDF report from analysis data.
 * Uses jsPDF (already in dependencies) — runs entirely client-side.
 */
export function generatePDFReport(analysis: Analysis): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const colors = {
    brand: [245, 158, 11] as [number, number, number],   // amber-500
    dark: [24, 24, 27] as [number, number, number],       // zinc-900
    text: [63, 63, 70] as [number, number, number],       // zinc-700
    muted: [113, 113, 122] as [number, number, number],   // zinc-500
    white: [255, 255, 255] as [number, number, number],
    green: [34, 197, 94] as [number, number, number],
    red: [239, 68, 68] as [number, number, number],
  };

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = margin;
    }
  }

  function heading(text: string, size: number = 14) {
    checkPage(14);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.dark);
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  }

  function body(text: string, indent: number = 0) {
    checkPage(8);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    const lines = doc.splitTextToSize(text, contentW - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4.2;
  }

  function separator() {
    checkPage(6);
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  }

  function scoreBar(label: string, score: number, maxScore: number = 100) {
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    doc.text(label, margin, y);
    doc.text(`${score}/${maxScore}`, pageW - margin - 12, y);

    const barY = y + 2;
    const barW = contentW - 40;
    const barH = 3;
    const barX = margin + 35;

    // Background
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(barX, barY, barW, barH, 1.5, 1.5, "F");

    // Fill
    const pct = Math.min(score / maxScore, 1);
    const fillColor = score >= 70 ? colors.green : score >= 40 ? colors.brand : colors.red;
    doc.setFillColor(...fillColor);
    doc.roundedRect(barX, barY, barW * pct, barH, 1.5, 1.5, "F");

    y += 10;
  }

  function bullet(text: string, indent: number = 4) {
    checkPage(8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    doc.text("•", margin + indent, y);
    const lines = doc.splitTextToSize(text, contentW - indent - 6);
    doc.text(lines, margin + indent + 4, y);
    y += lines.length * 4;
  }

  // ── Header Banner ──────────────────────────────────────────────────────
  doc.setFillColor(...colors.dark);
  doc.rect(0, 0, pageW, 38, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.white);
  doc.text("GrowthLens", margin, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.brand);
  doc.text("AI-Powered Product Growth Report", margin, 23);

  doc.setFontSize(8.5);
  doc.setTextColor(180, 180, 180);
  doc.text(`Website: ${analysis.url}`, margin, 30);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    34
  );

  y = 48;

  // ── Executive Summary ──────────────────────────────────────────────────
  if (analysis.executiveSummary) {
    heading("Executive Summary", 14);
    body(analysis.executiveSummary);
    y += 3;
    separator();
  }

  // ── Score Overview ─────────────────────────────────────────────────────
  heading("Score Overview", 14);
  y += 2;

  if (analysis.uxAnalysis) {
    scoreBar("UX Quality", analysis.uxAnalysis.overallScore);
  }
  if (analysis.conversionAnalysis) {
    scoreBar("Conversion", analysis.conversionAnalysis.funnelScore);
  }
  if (analysis.monetizationAnalysis) {
    scoreBar("Monetization", analysis.monetizationAnalysis.monetizationScore);
  }
  if (analysis.benchmarkAnalysis) {
    checkPage(10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    doc.text("Benchmark Grade", margin, y);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.brand);
    doc.text(analysis.benchmarkAnalysis.overallGrade, pageW - margin - 8, y);
    y += 10;
  }

  separator();

  // ── UX Analysis ────────────────────────────────────────────────────────
  if (analysis.uxAnalysis) {
    const ux = analysis.uxAnalysis;
    heading("UX Analysis", 13);

    heading("Cognitive Load", 10);
    body(`Score: ${ux.cognitiveLoad.score}/100 (lower is better)`);
    ux.cognitiveLoad.factors.forEach((f) => bullet(f));
    body(`Recommendation: ${ux.cognitiveLoad.recommendation}`, 2);
    y += 2;

    heading("CTA Clarity", 10);
    body(`Score: ${ux.ctaClarity.score}/100 | Primary CTA: ${ux.ctaClarity.primaryCTAFound ? "Found" : "Not Found"}`);
    ux.ctaClarity.issues.forEach((issue) => bullet(issue));
    body(`Recommendation: ${ux.ctaClarity.recommendation}`, 2);
    y += 2;

    if (ux.frictionPoints.length > 0) {
      heading("Friction Points", 10);
      ux.frictionPoints.forEach((fp) => {
        bullet(`[${fp.severity.toUpperCase()}] ${fp.location}: ${fp.description}`);
        body(`Fix: ${fp.suggestedFix}`, 10);
      });
    }
    separator();
  }

  // ── Conversion Analysis ────────────────────────────────────────────────
  if (analysis.conversionAnalysis) {
    const conv = analysis.conversionAnalysis;
    heading("Conversion Funnel Analysis", 13);

    if (conv.dropOffRisks.length > 0) {
      heading("Drop-off Risks", 10);
      conv.dropOffRisks.forEach((risk) => {
        bullet(`${risk.stage} (${risk.risk} risk): ${risk.reason}`);
        body(`Mitigation: ${risk.mitigation}`, 10);
      });
    }

    heading("Trust Signals", 10);
    body(`Score: ${conv.trustSignals.score}/100`);
    if (conv.trustSignals.present.length > 0) {
      body(`Present: ${conv.trustSignals.present.join(", ")}`, 2);
    }
    if (conv.trustSignals.missing.length > 0) {
      body(`Missing: ${conv.trustSignals.missing.join(", ")}`, 2);
    }
    separator();
  }

  // ── Monetization ───────────────────────────────────────────────────────
  if (analysis.monetizationAnalysis) {
    const mon = analysis.monetizationAnalysis;
    heading("Monetization Analysis", 13);
    scoreBar("Pricing Clarity", mon.pricingClarity.score);
    mon.pricingClarity.issues.forEach((i) => bullet(i));
    body(`Recommendation: ${mon.pricingClarity.recommendation}`, 2);
    y += 2;

    scoreBar("Plan Differentiation", mon.planDifferentiation.score);
    body(`Plans detected: ${mon.planDifferentiation.planCount}`, 2);
    separator();
  }

  // ── Top Recommendations ────────────────────────────────────────────────
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    heading("Top Recommendations", 14);
    y += 2;

    analysis.recommendations.forEach((rec) => {
      checkPage(25);

      // Recommendation card background
      doc.setFillColor(248, 248, 248);
      const cardH = 22;
      doc.roundedRect(margin, y - 1, contentW, cardH, 2, 2, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.dark);
      doc.text(`#${rec.rank} ${rec.title}`, margin + 4, y + 4);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.muted);
      doc.text(
        `${rec.category.toUpperCase()} • Impact: ${rec.expectedImpact} • Effort: ${rec.effort} • ROI: ${rec.roiScore}/10`,
        margin + 4,
        y + 10
      );

      doc.setFontSize(8.5);
      doc.setTextColor(...colors.text);
      const problemLines = doc.splitTextToSize(rec.problem, contentW - 8);
      doc.text(problemLines, margin + 4, y + 16);

      y += cardH + 4;
    });
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  checkPage(12);
  y += 4;
  doc.setDrawColor(...colors.brand);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.muted);
  doc.text("Generated by GrowthLens — AI-Powered Product Growth Analyzer", margin, y);
  doc.text("https://growthlens.app", pageW - margin - 30, y);

  return doc;
}

/** Download PDF helper */
export function downloadPDFReport(analysis: Analysis) {
  const doc = generatePDFReport(analysis);
  const domain = analysis.url ? new URL(analysis.url.startsWith("http") ? analysis.url : `https://${analysis.url}`).hostname.replace(/^www\./, "") : "report";
  doc.save(`growthlens-${domain}.pdf`);
}
