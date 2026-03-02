import { generateAnalysis, parseGeminiJSON, generateText } from "@/lib/gemini";
import { AI_CONFIG } from "@/config/constants";
import type {
  CrawlData,
  UXAnalysis,
  ConversionAnalysis,
  MonetizationAnalysis,
  BenchmarkAnalysis,
  Recommendation,
} from "@/types";

/**
 * Multi-step AI reasoning pipeline for product growth analysis.
 *
 * Architecture:
 * Each analysis stage is an independent Gemini call with a focused prompt.
 * Stages receive the crawl data and produce typed outputs.
 * This decomposition ensures:
 *   1. Each prompt stays focused → better reasoning
 *   2. Failures are isolated → partial results still usable
 *   3. Outputs are structured → stored directly in MongoDB
 */

/** Prepare a condensed page summary for AI context */
function buildPageContext(crawlData: CrawlData): string {
  return crawlData.pages
    .map((page) => {
      const ctaList = page.ctas.map((c) => `"${c.text}" (${c.position})`).join(", ");
      const headingList = page.headings.map((h) => `${"#".repeat(h.level)} ${h.text}`).join("\n");
      const proofList = page.socialProof.map((s) => s.type).join(", ");

      return `
=== PAGE: ${page.type.toUpperCase()} (${page.url}) ===
Title: ${page.title}
Meta: ${page.metaDescription ?? "none"}
Navigation depth: ${page.navigationDepth}
Structure: ${page.structure.sectionCount} sections, scroll: ${page.structure.estimatedScrollDepth}, nav: ${page.structure.hasNavigation}, footer: ${page.structure.hasFooter}
Copy tone: formality=${page.copyTone.formality}, urgency=${page.copyTone.urgency}, clarity=${page.copyTone.clarity}
Value proposition: ${page.copyTone.valueProposition ?? "none detected"}
Headings:
${headingList || "none"}
CTAs: ${ctaList || "none found"}
Forms: ${page.forms.length > 0 ? page.forms.map((f) => `${f.fieldCount} fields, submit="${f.submitButtonText}"`).join("; ") : "none"}
Social proof: ${proofList || "none"}
Content excerpt: ${page.rawTextContent.slice(0, 2000)}
`;
    })
    .join("\n\n");
}

// ─── Stage 1: UX Analysis ───────────────────────────────────────────────────

export async function analyzeUX(crawlData: CrawlData): Promise<UXAnalysis> {
  const context = buildPageContext(crawlData);

  const prompt = `You are analysing a SaaS website for UX quality. Here is the crawled data:

${context}

Perform a thorough UX analysis covering:
1. **Cognitive Load** — How much mental effort is required? Consider heading clarity, layout complexity, information density, jargon usage.
2. **CTA Clarity** — Is the primary action obvious? Are CTAs well-positioned, unambiguous, and compelling?
3. **Friction Points** — Where might users get confused, annoyed, or abandon? Consider forms, navigation depth, missing info.

Rules:
- Every finding MUST reference specific observed evidence from the crawled data.
- Score cognitive load 0-100 where LOWER is better (less load).
- Score CTA clarity 0-100 where HIGHER is better.
- Score overall UX 0-100.
- Be specific — cite actual heading text, CTA text, page structure details.

Return JSON matching this exact schema:
{
  "cognitiveLoad": {
    "score": <number 0-100>,
    "factors": [<string>],
    "recommendation": "<string>"
  },
  "ctaClarity": {
    "score": <number 0-100>,
    "primaryCTAFound": <boolean>,
    "issues": [<string>],
    "recommendation": "<string>"
  },
  "frictionPoints": [
    {
      "location": "<page or element>",
      "description": "<what's wrong>",
      "severity": "low|medium|high|critical",
      "suggestedFix": "<actionable fix>"
    }
  ],
  "overallScore": <number 0-100>,
  "evidence": [<string — specific observations>]
}`;

  const raw = await generateAnalysis(prompt);
  return parseGeminiJSON<UXAnalysis>(raw);
}

// ─── Stage 2: Conversion Funnel Analysis ────────────────────────────────────

export async function analyzeConversion(
  crawlData: CrawlData
): Promise<ConversionAnalysis> {
  const context = buildPageContext(crawlData);

  const prompt = `You are analysing a SaaS website's conversion funnel. Here is the crawled data:

${context}

Perform a thorough conversion funnel analysis covering:
1. **Drop-off Risks** — At which stages (awareness → interest → decision → action) are visitors most likely to leave? Why?
2. **Trust Signals** — What trust elements are present (testimonials, logos, metrics, badges, guarantees)? What's missing?
3. **Decision Blockers** — What prevents a visitor from converting? (unclear pricing, no free trial, missing FAQ, etc.)

Rules:
- Reference specific observed elements.
- Rate each drop-off risk as low/medium/high.
- Score the overall funnel 0-100.
- Provide specific, actionable mitigations.

Return JSON matching this exact schema:
{
  "dropOffRisks": [
    {
      "stage": "<funnel stage>",
      "risk": "low|medium|high",
      "reason": "<why>",
      "mitigation": "<what to do>"
    }
  ],
  "trustSignals": {
    "score": <number 0-100>,
    "present": [<string>],
    "missing": [<string>],
    "recommendation": "<string>"
  },
  "decisionBlockers": [
    {
      "description": "<blocker>",
      "impact": "low|medium|high",
      "resolution": "<fix>"
    }
  ],
  "funnelScore": <number 0-100>,
  "evidence": [<string>]
}`;

  const raw = await generateAnalysis(prompt);
  return parseGeminiJSON<ConversionAnalysis>(raw);
}

// ─── Stage 3: Monetization Analysis ─────────────────────────────────────────

export async function analyzeMonetization(
  crawlData: CrawlData
): Promise<MonetizationAnalysis> {
  const context = buildPageContext(crawlData);

  const prompt = `You are analysing a SaaS website's monetization strategy. Here is the crawled data:

${context}

Perform a thorough monetization analysis covering:
1. **Pricing Clarity** — Is pricing easy to find and understand? Are there hidden costs? Is the value/price relationship clear?
2. **Plan Differentiation** — Are plans clearly differentiated? Can users easily choose the right plan?
3. **Upsell Opportunities** — What revenue opportunities are being missed? (annual discounts, add-ons, enterprise tier, etc.)

Rules:
- If no pricing page was found, note this as a critical gap.
- Reference specific pricing elements, plan names, feature lists.
- Score each area 0-100.

Return JSON matching this exact schema:
{
  "pricingClarity": {
    "score": <number 0-100>,
    "issues": [<string>],
    "recommendation": "<string>"
  },
  "planDifferentiation": {
    "score": <number 0-100>,
    "planCount": <number>,
    "issues": [<string>],
    "recommendation": "<string>"
  },
  "upsellOpportunities": [
    {
      "description": "<opportunity>",
      "expectedImpact": "low|medium|high",
      "implementation": "<how to implement>"
    }
  ],
  "monetizationScore": <number 0-100>,
  "evidence": [<string>]
}`;

  const raw = await generateAnalysis(prompt);
  return parseGeminiJSON<MonetizationAnalysis>(raw);
}

// ─── Stage 4: Benchmark Analysis ────────────────────────────────────────────

export async function analyzeBenchmarks(
  crawlData: CrawlData
): Promise<BenchmarkAnalysis> {
  const context = buildPageContext(crawlData);

  const prompt = `You are benchmarking a SaaS website against industry best practices. Here is the crawled data:

${context}

Compare this website against established SaaS best practices across these categories:
1. **Homepage / Landing** — Clear value prop, social proof, single CTA focus, F-pattern layout
2. **Pricing Page** — Transparent pricing, 3 plan maximum, feature comparison, FAQ
3. **Signup Flow** — Minimal friction, social auth, progressive profiling
4. **Trust & Credibility** — Testimonials, security badges, company info, case studies
5. **Content & Copy** — Benefit-oriented, scannable, no jargon, strong CTAs
6. **Technical** — SSL, mobile-responsive indicators, fast load indicators

Rules:
- Grade each category A-F based on how well it matches best practices.
- Provide an overall grade.
- Identify specific gaps with priority levels.
- Note strengths as well.

Return JSON matching this exact schema:
{
  "overallGrade": "A|B|C|D|F",
  "categoryGrades": [
    {
      "category": "<category name>",
      "grade": "A|B|C|D|F",
      "explanation": "<why this grade>"
    }
  ],
  "gaps": [
    {
      "area": "<what area>",
      "currentState": "<what exists now>",
      "bestPractice": "<what should exist>",
      "priority": "low|medium|high"
    }
  ],
  "strengths": [<string>]
}`;

  const raw = await generateAnalysis(prompt);
  return parseGeminiJSON<BenchmarkAnalysis>(raw);
}

// ─── Stage 5: Recommendations ───────────────────────────────────────────────

export async function generateRecommendations(
  crawlData: CrawlData,
  ux: UXAnalysis,
  conversion: ConversionAnalysis,
  monetization: MonetizationAnalysis,
  benchmark: BenchmarkAnalysis
): Promise<Recommendation[]> {
  const prompt = `You are a senior product growth consultant. Based on the following analysis results, generate a prioritised list of the top 7-10 actionable recommendations.

## UX Analysis (Score: ${ux.overallScore}/100)
Cognitive load score: ${ux.cognitiveLoad.score}
CTA clarity score: ${ux.ctaClarity.score}
Friction points: ${ux.frictionPoints.map((f) => f.description).join("; ")}

## Conversion Analysis (Score: ${conversion.funnelScore}/100)
Drop-off risks: ${conversion.dropOffRisks.map((d) => `${d.stage}: ${d.reason}`).join("; ")}
Trust score: ${conversion.trustSignals.score}
Decision blockers: ${conversion.decisionBlockers.map((b) => b.description).join("; ")}

## Monetization Analysis (Score: ${monetization.monetizationScore}/100)
Pricing clarity: ${monetization.pricingClarity.score}
Plan differentiation: ${monetization.planDifferentiation.score}
Upsell opportunities: ${monetization.upsellOpportunities.map((u) => u.description).join("; ")}

## Benchmark Analysis (Grade: ${benchmark.overallGrade})
Gaps: ${benchmark.gaps.map((g) => `${g.area}: ${g.currentState} → should be ${g.bestPractice}`).join("; ")}

## Website Context
Domain: ${crawlData.metadata.domain}
Pages crawled: ${crawlData.pages.map((p) => `${p.type} (${p.url})`).join(", ")}

Rules:
- Rank by ROI (impact vs effort). Highest ROI first.
- Each recommendation must include observed EVIDENCE — don't make generic suggestions.
- roiScore is 1-10 where 10 = highest ROI.
- Be specific about WHAT to change and WHERE.
- Category must be one of: ux, conversion, monetization, technical.

Return a JSON array of recommendations matching this schema:
[
  {
    "rank": <number>,
    "title": "<short actionable title>",
    "problem": "<what's wrong — cite evidence>",
    "whyItMatters": "<business impact>",
    "whatToChange": "<specific implementation steps>",
    "expectedImpact": "low|medium|high|critical",
    "effort": "low|medium|high",
    "category": "ux|conversion|monetization|technical",
    "evidence": [<string — specific observations>],
    "roiScore": <number 1-10>
  }
]`;

  const raw = await generateAnalysis(prompt);
  return parseGeminiJSON<Recommendation[]>(raw);
}

// ─── Stage 6: Executive Summary ─────────────────────────────────────────────

export async function generateExecutiveSummary(
  crawlData: CrawlData,
  ux: UXAnalysis,
  conversion: ConversionAnalysis,
  monetization: MonetizationAnalysis,
  benchmark: BenchmarkAnalysis,
  recommendations: Recommendation[]
): Promise<string> {
  const top3 = recommendations.slice(0, 3);

  const prompt = `Write a concise executive summary (3-4 paragraphs) for a product growth analysis of ${crawlData.metadata.domain}.

Key metrics:
- UX Score: ${ux.overallScore}/100
- Conversion Funnel Score: ${conversion.funnelScore}/100
- Monetization Score: ${monetization.monetizationScore}/100
- Benchmark Grade: ${benchmark.overallGrade}

Top 3 recommendations:
${top3.map((r) => `${r.rank}. ${r.title} — ${r.problem}`).join("\n")}

Key strengths: ${benchmark.strengths.join(", ")}
Critical gaps: ${benchmark.gaps.filter((g) => g.priority === "high").map((g) => g.area).join(", ")}

Write in a professional consulting tone. Be direct and evidence-based. The audience is a founder or PM who needs to understand the situation quickly and decide what to prioritize.

Do NOT use markdown headers. Write flowing paragraphs.`;

  return generateText(prompt);
}
