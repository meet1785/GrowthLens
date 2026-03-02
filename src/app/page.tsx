import Link from "next/link";
import {
  ArrowRight,
  Target,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  FileText,
  Activity,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
        <Activity className="w-4 h-4 text-white" />
      </div>
      <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
        Growth<span className="text-amber-500">Lens</span>
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-grid overflow-hidden">
      {/* ── Header ──────────────────────────────────── */}
      <header className="border-b border-[var(--border-subtle)] relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold text-[var(--bg-void)] bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-[var(--accent-dim)] text-amber-400 text-sm font-mono font-medium px-4 py-1.5 rounded-full mb-8 border border-amber-500/20">
            <Zap size={14} className="text-amber-500" />
            AI-Powered Product Analysis
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-1 text-display text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)] mb-6">
            See why your product
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              isn&apos;t growing
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up delay-2 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
            GrowthLens crawls your SaaS site and delivers a consulting-grade
            report — UX friction, conversion leaks, monetization gaps — with
            ranked, evidence-based fixes.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-3 flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[var(--bg-void)] font-semibold px-7 py-3.5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              Start Free Analysis
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] font-medium px-6 py-3.5 rounded-xl border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)] transition-all duration-200 text-base"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Terminal preview mock */}
        <div className="animate-scale-in delay-5 max-w-2xl mx-auto mt-20 relative">
          <div className="glass-strong rounded-xl overflow-hidden glow-amber">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
                growthlens — analysis
              </span>
            </div>
            <div className="p-5 font-mono text-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">$</span>
                <span className="text-[var(--text-primary)]">
                  growthlens analyze stripe.com
                </span>
              </div>
              <div className="text-[var(--text-muted)]">
                ◈ Crawling 8 pages...{" "}
                <span className="text-green-400">done</span>
              </div>
              <div className="text-[var(--text-muted)]">
                ◈ UX Analysis...{" "}
                <span className="text-green-400">score: 82/100</span>
              </div>
              <div className="text-[var(--text-muted)]">
                ◈ Conversion Funnel...{" "}
                <span className="text-amber-400">score: 64/100</span>
              </div>
              <div className="text-[var(--text-muted)]">
                ◈ Monetization...{" "}
                <span className="text-green-400">score: 78/100</span>
              </div>
              <div className="text-[var(--text-muted)]">
                ◈ Benchmarking...{" "}
                <span className="text-cyan-400">grade: B+</span>
              </div>
              <div className="mt-1 text-green-400">
                ✓ Report ready — 5 critical recommendations found
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-deep)] to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="animate-fade-up text-display text-3xl md:text-4xl text-[var(--text-primary)] mb-4">
              A complete growth audit
              <span className="text-amber-500"> in minutes</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Our multi-step AI pipeline analyzes your website like a team of
              senior consultants — but in a fraction of the time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                title: "UX Analysis",
                description:
                  "Evaluate cognitive load, CTA clarity, and friction points that cause visitors to bounce.",
                accent: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
              {
                icon: TrendingUp,
                title: "Conversion Funnel",
                description:
                  "Identify drop-off risks, missing trust signals, and decision blockers in your funnel.",
                accent: "text-cyan-400",
                bg: "bg-cyan-500/10",
                border: "border-cyan-500/20",
              },
              {
                icon: DollarSign,
                title: "Monetization",
                description:
                  "Assess pricing clarity, plan differentiation, and upsell opportunities you're missing.",
                accent: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                icon: Activity,
                title: "Benchmarking",
                description:
                  "Compare against SaaS best practices and get letter grades across all categories.",
                accent: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
              {
                icon: Shield,
                title: "Evidence-Based",
                description:
                  "Every insight references specific observed elements — no generic AI filler.",
                accent: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                icon: FileText,
                title: "Exportable Reports",
                description:
                  "Download complete reports as Markdown or view them on the web. Share with your team.",
                accent: "text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`animate-fade-up delay-${i + 1} glass rounded-xl p-6 hover:bg-[var(--bg-elevated)] transition-all duration-300 group border border-[var(--border-subtle)] hover:${feature.border}`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feature.bg}`}
                >
                  <feature.icon size={20} className={feature.accent} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display text-3xl md:text-4xl text-[var(--text-primary)] text-center mb-16">
            Three steps to
            <span className="text-amber-500"> clarity</span>
          </h2>
          <div className="space-y-10">
            {[
              {
                step: "01",
                title: "Enter a URL",
                description:
                  "Paste any SaaS website URL. GrowthLens will automatically discover and crawl key pages — landing, pricing, signup, and more.",
              },
              {
                step: "02",
                title: "AI analyzes everything",
                description:
                  "Our multi-step Gemini-powered pipeline runs UX, conversion, monetization, and benchmark analyses — each with focused reasoning.",
              },
              {
                step: "03",
                title: "Get your report",
                description:
                  "Receive a professional consulting report with scored categories, ranked recommendations with ROI estimates, and an executive summary.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`animate-fade-up delay-${i + 1} flex gap-6 items-start`}
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-[var(--bg-void)] flex items-center justify-center font-mono font-bold text-sm shadow-lg shadow-amber-500/20">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="glass-strong rounded-2xl p-12 glow-amber border border-[var(--border-subtle)]">
            <h2 className="text-display text-3xl md:text-4xl text-[var(--text-primary)] mb-4">
              Ready to find your growth levers?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg">
              Get a professional-grade product analysis in under 2 minutes.
            </p>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[var(--bg-void)] font-semibold px-8 py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30"
            >
              Start Your Free Analysis
              <ArrowRight
                size={18}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--text-muted)]">
          <Logo />
          <p className="font-mono text-xs">
            Built with Next.js, Gemini AI & MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}
