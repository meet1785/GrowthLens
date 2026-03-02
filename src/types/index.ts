// ─── Core Application Types ─────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Analysis Types ─────────────────────────────────────────────────────────

export type AnalysisStatus =
  | "pending"
  | "crawling"
  | "analyzing"
  | "completed"
  | "failed";

export interface Analysis {
  _id: string;
  userId: string;
  url: string;
  status: AnalysisStatus;
  progress: number; // 0-100
  crawlData?: CrawlData;
  uxAnalysis?: UXAnalysis;
  conversionAnalysis?: ConversionAnalysis;
  monetizationAnalysis?: MonetizationAnalysis;
  benchmarkAnalysis?: BenchmarkAnalysis;
  recommendations?: Recommendation[];
  executiveSummary?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Crawl Types ────────────────────────────────────────────────────────────

export interface CrawlData {
  pages: PageData[];
  metadata: SiteMetadata;
  crawledAt: Date;
}

export interface PageData {
  url: string;
  type: PageType;
  title: string;
  metaDescription?: string;
  headings: HeadingData[];
  ctas: CTAData[];
  copyTone: CopyToneAnalysis;
  navigationDepth: number;
  forms: FormData[];
  socialProof: SocialProofElement[];
  loadIndicators: LoadIndicator[];
  rawTextContent: string;
  structure: PageStructure;
}

export type PageType =
  | "landing"
  | "pricing"
  | "signup"
  | "checkout"
  | "about"
  | "features"
  | "blog"
  | "docs"
  | "other";

export interface HeadingData {
  level: number;
  text: string;
  position: "above-fold" | "below-fold";
}

export interface CTAData {
  text: string;
  type: "primary" | "secondary" | "tertiary";
  href?: string;
  position: "header" | "hero" | "body" | "footer" | "sticky";
  isAboveFold: boolean;
}

export interface CopyToneAnalysis {
  formality: "casual" | "professional" | "mixed";
  urgency: "low" | "medium" | "high";
  clarity: "clear" | "moderate" | "unclear";
  valueProposition: string | null;
}

export interface FormData {
  fieldCount: number;
  hasPasswordField: boolean;
  hasEmailField: boolean;
  submitButtonText: string;
  requiredFields: number;
}

export interface SocialProofElement {
  type: "testimonial" | "logo" | "metric" | "review" | "badge";
  text?: string;
}

export interface LoadIndicator {
  type: "heavy-scripts" | "large-page" | "many-requests";
  detail: string;
}

export interface PageStructure {
  hasNavigation: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
  sectionCount: number;
  estimatedScrollDepth: "short" | "medium" | "long";
}

export interface SiteMetadata {
  domain: string;
  title: string;
  description?: string;
  favicon?: string;
  hasSSL: boolean;
  pageCount: number;
  discoveredUrls: string[];
}

// ─── AI Analysis Types ──────────────────────────────────────────────────────

export interface UXAnalysis {
  cognitiveLoad: CognitiveLoadAssessment;
  ctaClarity: CTAClarityAssessment;
  frictionPoints: FrictionPoint[];
  overallScore: number; // 0-100
  evidence: string[];
}

export interface CognitiveLoadAssessment {
  score: number; // 0-100 (lower is better, means less load)
  factors: string[];
  recommendation: string;
}

export interface CTAClarityAssessment {
  score: number;
  primaryCTAFound: boolean;
  issues: string[];
  recommendation: string;
}

export interface FrictionPoint {
  location: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  suggestedFix: string;
}

export interface ConversionAnalysis {
  dropOffRisks: DropOffRisk[];
  trustSignals: TrustSignalAssessment;
  decisionBlockers: DecisionBlocker[];
  funnelScore: number; // 0-100
  evidence: string[];
}

export interface DropOffRisk {
  stage: string;
  risk: "low" | "medium" | "high";
  reason: string;
  mitigation: string;
}

export interface TrustSignalAssessment {
  score: number;
  present: string[];
  missing: string[];
  recommendation: string;
}

export interface DecisionBlocker {
  description: string;
  impact: "low" | "medium" | "high";
  resolution: string;
}

export interface MonetizationAnalysis {
  pricingClarity: PricingClarityAssessment;
  planDifferentiation: PlanDifferentiationAssessment;
  upsellOpportunities: UpsellOpportunity[];
  monetizationScore: number; // 0-100
  evidence: string[];
}

export interface PricingClarityAssessment {
  score: number;
  issues: string[];
  recommendation: string;
}

export interface PlanDifferentiationAssessment {
  score: number;
  planCount: number;
  issues: string[];
  recommendation: string;
}

export interface UpsellOpportunity {
  description: string;
  expectedImpact: "low" | "medium" | "high";
  implementation: string;
}

export interface BenchmarkAnalysis {
  overallGrade: "A" | "B" | "C" | "D" | "F";
  categoryGrades: CategoryGrade[];
  gaps: BenchmarkGap[];
  strengths: string[];
}

export interface CategoryGrade {
  category: string;
  grade: "A" | "B" | "C" | "D" | "F";
  explanation: string;
}

export interface BenchmarkGap {
  area: string;
  currentState: string;
  bestPractice: string;
  priority: "low" | "medium" | "high";
}

// ─── Recommendation Types ───────────────────────────────────────────────────

export interface Recommendation {
  rank: number;
  title: string;
  problem: string;
  whyItMatters: string;
  whatToChange: string;
  expectedImpact: "low" | "medium" | "high" | "critical";
  effort: "low" | "medium" | "high";
  category: "ux" | "conversion" | "monetization" | "technical";
  evidence: string[];
  roiScore: number; // 1-10
}

// ─── Report Types ───────────────────────────────────────────────────────────

export interface Report {
  _id: string;
  analysisId: string;
  userId: string;
  executiveSummary: string;
  uxFindings: string;
  growthBottlenecks: string;
  monetizationInsights: string;
  topActions: Recommendation[];
  generatedAt: Date;
}

export type ExportFormat = "web" | "markdown" | "pdf";

// ─── API Types ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisRequest {
  url: string;
}

export interface AnalysisProgressEvent {
  status: AnalysisStatus;
  progress: number;
  message: string;
  stage?: string;
}
