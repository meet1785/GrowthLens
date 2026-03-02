import axios from "axios";
import * as cheerio from "cheerio";
import { CRAWL_CONFIG } from "@/config/constants";
import { normalizeUrl, extractDomain, sleep } from "@/lib/utils";
import type {
  CrawlData,
  PageData,
  PageType,
  HeadingData,
  CTAData,
  SocialProofElement,
  PageStructure,
  SiteMetadata,
  CopyToneAnalysis,
} from "@/types";

type CheerioRoot = ReturnType<typeof cheerio.load>;

/**
 * Web crawler service – fetches and parses key website pages
 * to extract structural data for AI analysis.
 *
 * Design decisions:
 * - Server-side only (runs in API routes / background jobs)
 * - Cheerio for HTML parsing (fast, no browser overhead)
 * - Respectful crawling with delays and user-agent
 * - Extracts structure, not visuals – AI reasons over structure
 */

export class WebCrawler {
  private baseUrl: string;
  private domain: string;
  private visited = new Set<string>();

  constructor(url: string) {
    this.baseUrl = normalizeUrl(url);
    this.domain = extractDomain(this.baseUrl);
  }

  /** Main entry: crawl site and return structured data */
  async crawl(): Promise<CrawlData> {
    const discoveredUrls = await this.discoverPages();
    const pages: PageData[] = [];

    for (const pageUrl of discoveredUrls.slice(0, CRAWL_CONFIG.maxPages)) {
      try {
        const pageData = await this.crawlPage(pageUrl);
        if (pageData) pages.push(pageData);
        await sleep(CRAWL_CONFIG.crawlDelay);
      } catch (err) {
        console.warn(`Failed to crawl ${pageUrl}:`, err);
      }
    }

    const metadata: SiteMetadata = {
      domain: this.domain,
      title: pages[0]?.title ?? this.domain,
      description: pages[0]?.metaDescription ?? undefined,
      hasSSL: this.baseUrl.startsWith("https"),
      pageCount: pages.length,
      discoveredUrls,
    };

    return {
      pages,
      metadata,
      crawledAt: new Date(),
    };
  }

  /** Discover key pages by checking known SaaS URL patterns */
  private async discoverPages(): Promise<string[]> {
    const urls: string[] = [this.baseUrl];

    // Try common SaaS page patterns
    for (const [, patterns] of Object.entries(
      CRAWL_CONFIG.priorityPagePatterns
    )) {
      for (const pattern of patterns) {
        const candidate = new URL(pattern, this.baseUrl).href;
        if (!urls.includes(candidate)) {
          urls.push(candidate);
        }
      }
    }

    // Also discover from homepage links
    try {
      const html = await this.fetchPage(this.baseUrl);
      if (html) {
        const $: CheerioRoot = cheerio.load(html);
        $("a[href]").each((_, el) => {
          const href = $(el).attr("href");
          if (!href) return;
          try {
            const resolved = new URL(href, this.baseUrl);
            if (
              resolved.hostname === new URL(this.baseUrl).hostname &&
              !resolved.hash &&
              !urls.includes(resolved.href) &&
              !this.isAssetUrl(resolved.href)
            ) {
              urls.push(resolved.href);
            }
          } catch {
            // skip invalid URLs
          }
        });
      }
    } catch {
      // homepage fetch failed, continue with pattern-based urls
    }

    return urls.slice(0, CRAWL_CONFIG.maxPages * 2); // discover more than we crawl
  }

  /** Fetch a single page's HTML */
  private async fetchPage(url: string): Promise<string | null> {
    if (this.visited.has(url)) return null;
    this.visited.add(url);

    try {
      const response = await axios.get(url, {
        timeout: CRAWL_CONFIG.requestTimeout,
        headers: {
          "User-Agent": CRAWL_CONFIG.userAgent,
          Accept: "text/html,application/xhtml+xml",
        },
        maxRedirects: 3,
        maxContentLength: CRAWL_CONFIG.maxContentSize,
        validateStatus: (status) => status < 400,
      });

      const contentType = response.headers["content-type"] ?? "";
      if (!contentType.includes("text/html")) return null;

      return response.data;
    } catch {
      return null;
    }
  }

  /** Parse a page into structured data */
  private async crawlPage(url: string): Promise<PageData | null> {
    const html = await this.fetchPage(url);
    if (!html) return null;

    const $: CheerioRoot = cheerio.load(html);

    // Remove scripts, styles, and other noise
    $("script, style, noscript, iframe, svg").remove();

    const pageType = this.classifyPage(url, $);

    return {
      url,
      type: pageType,
      title: $("title").text().trim() || $("h1").first().text().trim() || "",
      metaDescription:
        $('meta[name="description"]').attr("content") ?? undefined,
      headings: this.extractHeadings($),
      ctas: this.extractCTAs($),
      copyTone: this.analyzeCopyTone($),
      navigationDepth: this.calculateNavDepth(url),
      forms: this.extractForms($),
      socialProof: this.extractSocialProof($),
      loadIndicators: [],
      rawTextContent: this.extractTextContent($).slice(0, 8000), // cap for AI context
      structure: this.analyzeStructure($),
    };
  }

  /** Classify page type from URL patterns and content */
  private classifyPage(url: string, $: CheerioRoot): PageType {
    const path = new URL(url).pathname.toLowerCase();
    const patterns = CRAWL_CONFIG.priorityPagePatterns;

    for (const [type, paths] of Object.entries(patterns)) {
      if (paths.some((p) => path === p || path.startsWith(p + "/"))) {
        return type as PageType;
      }
    }

    // Content-based classification fallback
    const bodyText = $("body").text().toLowerCase();
    if (path === "/" || path === "") return "landing";
    if (bodyText.includes("pricing") && bodyText.includes("plan"))
      return "pricing";
    if (bodyText.includes("sign up") || bodyText.includes("register"))
      return "signup";
    if (bodyText.includes("features")) return "features";

    return "other";
  }

  /** Extract heading hierarchy */
  private extractHeadings($: CheerioRoot): HeadingData[] {
    const headings: HeadingData[] = [];
    $("h1, h2, h3, h4").each((i, el) => {
      const text = $(el).text().trim();
      const tagName = (el as unknown as { tagName: string }).tagName;
      if (text && tagName) {
        headings.push({
          level: parseInt(tagName.charAt(1)),
          text: text.slice(0, 200),
          position: i < 3 ? "above-fold" : "below-fold",
        });
      }
    });
    return headings.slice(0, 30);
  }

  /** Extract CTAs (buttons and prominent links) */
  private extractCTAs($: CheerioRoot): CTAData[] {
    const ctas: CTAData[] = [];
    const ctaSelectors = [
      'a[class*="btn"], a[class*="button"], a[class*="cta"]',
      'button, [role="button"]',
      'a[class*="primary"], a[class*="action"]',
      ".hero a, .header a",
    ];

    const seen = new Set<string>();

    ctaSelectors.forEach((selector, selectorIndex) => {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (!text || text.length > 100 || seen.has(text)) return;
        seen.add(text);

        const href = $(el).attr("href") ?? undefined;
        const parent = $(el).closest("header, .hero, nav, footer, main");
        const parentTag = parent.length
          ? (parent.prop("tagName")?.toLowerCase() ?? "body")
          : "body";

        let position: CTAData["position"] = "body";
        if (parentTag === "header" || parentTag === "nav") position = "header";
        else if (parentTag === "footer") position = "footer";
        else if (parent.hasClass("hero") || i === 0) position = "hero";

        ctas.push({
          text: text.slice(0, 100),
          type: selectorIndex === 0 || i === 0 ? "primary" : "secondary",
          href,
          position,
          isAboveFold: i < 3,
        });
      });
    });

    return ctas.slice(0, 20);
  }

  /** Rough copy tone analysis from text content */
  private analyzeCopyTone($: CheerioRoot): CopyToneAnalysis {
    const text = $("body").text().toLowerCase();
    const h1 = $("h1").first().text().trim();

    const casualWords = ["hey", "awesome", "cool", "super", "easy"];
    const formalWords = [
      "enterprise",
      "solution",
      "leverage",
      "optimize",
      "comprehensive",
    ];
    const urgencyWords = [
      "now",
      "today",
      "limited",
      "hurry",
      "don't miss",
      "last chance",
    ];

    const casualCount = casualWords.filter((w) => text.includes(w)).length;
    const formalCount = formalWords.filter((w) => text.includes(w)).length;
    const urgencyCount = urgencyWords.filter((w) => text.includes(w)).length;

    return {
      formality:
        formalCount > casualCount
          ? "professional"
          : casualCount > formalCount
            ? "casual"
            : "mixed",
      urgency:
        urgencyCount >= 3 ? "high" : urgencyCount >= 1 ? "medium" : "low",
      clarity: h1.length > 0 && h1.length < 80 ? "clear" : "moderate",
      valueProposition: h1 || null,
    };
  }

  /** How deep is this page from root */
  private calculateNavDepth(url: string): number {
    const path = new URL(url).pathname;
    return path.split("/").filter(Boolean).length;
  }

  /** Extract form data */
  private extractForms($: CheerioRoot): PageData["forms"] {
    const forms: PageData["forms"] = [];
    $("form").each((_, form) => {
      const inputs = $(form).find(
        "input:not([type=hidden]):not([type=submit])"
      );
      forms.push({
        fieldCount: inputs.length,
        hasPasswordField: $(form).find('input[type="password"]').length > 0,
        hasEmailField: $(form).find('input[type="email"]').length > 0,
        submitButtonText:
          $(form).find('button[type="submit"], input[type="submit"]').text().trim() ||
          "Submit",
        requiredFields: $(form).find("[required]").length,
      });
    });
    return forms;
  }

  /** Extract social proof elements */
  private extractSocialProof($: CheerioRoot): SocialProofElement[] {
    const proof: SocialProofElement[] = [];
    const text = $("body").text().toLowerCase();

    // Testimonials
    $(
      '[class*="testimonial"], [class*="review"], [class*="quote"], blockquote'
    ).each((_, el) => {
      proof.push({
        type: "testimonial",
        text: $(el).text().trim().slice(0, 200),
      });
    });

    // Logos
    $('[class*="logo"], [class*="client"], [class*="partner"]').each(() => {
      proof.push({ type: "logo" });
    });

    // Metrics
    if (
      text.match(
        /\d+[,.]?\d*\s*(customers|users|companies|teams|downloads)/
      )
    ) {
      proof.push({ type: "metric" });
    }

    // Trust badges
    if (
      text.includes("soc 2") ||
      text.includes("gdpr") ||
      text.includes("hipaa") ||
      text.includes("iso 27001")
    ) {
      proof.push({ type: "badge" });
    }

    return proof.slice(0, 15);
  }

  /** Analyse page structure */
  private analyzeStructure($: CheerioRoot): PageStructure {
    const sections = $("section, [class*='section']").length;
    const textLength = $("body").text().length;

    return {
      hasNavigation:
        $("nav, [role='navigation'], header").length > 0,
      hasFooter: $("footer").length > 0,
      hasSidebar:
        $("aside, [class*='sidebar'], [role='complementary']").length > 0,
      sectionCount: sections || $("main > div").length || 1,
      estimatedScrollDepth:
        textLength > 10000 ? "long" : textLength > 3000 ? "medium" : "short",
    };
  }

  /** Get cleaned text content for AI analysis */
  private extractTextContent($: CheerioRoot): string {
    return $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Check if URL points to a non-HTML asset */
  private isAssetUrl(url: string): boolean {
    const assetExtensions = [
      ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
      ".css", ".js", ".woff", ".woff2", ".ttf", ".eot",
      ".pdf", ".zip", ".mp4", ".mp3", ".avi",
    ];
    const lower = url.toLowerCase();
    return assetExtensions.some((ext) => lower.endsWith(ext));
  }
}
