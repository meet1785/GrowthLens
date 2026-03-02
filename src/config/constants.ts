/**
 * Application configuration constants
 * Centralized config to avoid magic numbers and strings throughout the codebase
 */

export const APP_CONFIG = {
  name: "GrowthLens",
  description: "AI-Powered Product Growth Analyzer",
  version: "1.0.0",
} as const;

export const CRAWL_CONFIG = {
  /** Maximum number of pages to crawl per analysis */
  maxPages: 10,
  /** Request timeout in milliseconds */
  requestTimeout: 15000,
  /** Delay between requests to be respectful */
  crawlDelay: 1000,
  /** Maximum content size to process (5MB) */
  maxContentSize: 5 * 1024 * 1024,
  /** User agent for crawling */
  userAgent:
    "GrowthLens/1.0 (Product Analysis Bot; +https://growthlens.app/bot)",
  /** Page types to prioritize during crawling */
  priorityPagePatterns: {
    landing: ["/", "/home"],
    pricing: ["/pricing", "/plans", "/packages"],
    signup: ["/signup", "/register", "/sign-up", "/get-started", "/trial"],
    checkout: ["/checkout", "/subscribe", "/payment", "/buy"],
    features: ["/features", "/product", "/solutions"],
    about: ["/about", "/company", "/team"],
  },
} as const;

export const AI_CONFIG = {
  /** Model to use for analysis (Gemini) */
  model: "gemini-2.0-flash" as const,
  /** Max tokens per analysis step */
  maxOutputTokens: 8192,
  /** Temperature for consistent analysis */
  temperature: 0.3,
  /** System prompt prefix */
  systemPromptPrefix:
    "You are an expert product growth analyst and UX consultant with 15+ years of experience analyzing SaaS products. You provide evidence-based, actionable insights. Every claim must reference specific observed evidence from the website. Avoid generic advice.",
} as const;

export const ANALYSIS_STAGES = {
  crawling: { label: "Crawling website", weight: 20 },
  ux: { label: "Analyzing UX patterns", weight: 20 },
  conversion: { label: "Evaluating conversion funnel", weight: 20 },
  monetization: { label: "Assessing monetization", weight: 15 },
  benchmarking: { label: "Benchmarking against best practices", weight: 10 },
  recommendations: { label: "Generating recommendations", weight: 10 },
  report: { label: "Compiling report", weight: 5 },
} as const;

export const RATE_LIMIT = {
  /** Max analyses per user per hour */
  maxAnalysesPerHour: 5,
  /** Max API requests per minute */
  maxRequestsPerMinute: 30,
} as const;
