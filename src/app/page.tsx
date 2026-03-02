import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Activity, Target, BarChart3, ShieldCheck, Clock3 } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent-dim)] border border-amber-300/25 flex items-center justify-center">
        <Activity className="w-4 h-4 text-amber-300" />
      </div>
      <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
        Growth<span className="text-amber-300">Lens</span>
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen app-shell-bg bg-grid overflow-hidden relative">
      <div className="genz-orb w-52 h-52 bg-sky-400/40 top-16 -left-14 animate-float-soft" />
      <div className="genz-orb w-64 h-64 bg-amber-300/40 bottom-16 -right-16 animate-float-soft delay-4" />

      <header className="border-b border-[var(--border-subtle)] relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold text-[#18120a] bg-[var(--accent)] hover:bg-[var(--accent-light)] px-4 py-2 rounded-[var(--radius-sm)] transition-colors"
            >
              Start
            </Link>
          </div>
        </div>
      </header>

      <main className="app-page space-y-16 md:space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
          <div className="lg:col-span-3 app-surface-strong p-5 md:p-7 soft-glow hover-lift animate-fade-up">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="genz-chip text-xs text-amber-200 font-mono animate-float-soft">AI Audit</span>
              <span className="genz-chip text-xs text-blue-200 font-mono animate-float-soft delay-2">Realtime Signals</span>
              <span className="genz-chip text-xs text-emerald-200 font-mono animate-float-soft delay-3">Actionable Fixes</span>
            </div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-3">
              Growth decision workspace
            </p>
            <h1 className="text-display text-3xl md:text-5xl text-[var(--text-primary)]">
              Find the exact
              <span className="genz-gradient-text animate-gradient"> growth blockers </span>
              in your product funnel.
            </h1>
            <p className="mt-4 text-[var(--text-secondary)] max-w-2xl">
              GrowthLens crawls your SaaS website, scores UX and conversion quality, and returns evidence-backed fixes you can execute this sprint.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#18120a] font-semibold px-5 py-3 rounded-[var(--radius-sm)] hover:bg-[var(--accent-light)] transition-colors"
              >
                Start free analysis
                <ArrowRight size={17} />
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-[var(--text-secondary)] font-medium px-5 py-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
              >
                Open dashboard
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 app-surface p-5 md:p-6 hover-lift animate-fade-up delay-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-3">Live mission model</p>
            <div className="mb-4 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)]">
              <Image
                src="/illustrations/growth-orbit.svg"
                alt="GrowthLens analytics orbit visualization"
                width={720}
                height={520}
                className="w-full h-44 object-cover animate-tilt"
              />
            </div>
            <div className="space-y-3 text-sm">
              <div className="metric-block hover-lift">
                <p className="text-[var(--text-muted)]">Website crawl</p>
                <p className="text-[var(--text-primary)] font-medium mt-1">6 pages discovered · 42s</p>
              </div>
              <div className="metric-block hover-lift">
                <p className="text-[var(--text-muted)]">Conversion risk score</p>
                <p className="text-amber-300 font-medium mt-1">64 / 100 · needs action</p>
              </div>
              <div className="metric-block hover-lift">
                <p className="text-[var(--text-muted)]">Top recommendation</p>
                <p className="text-[var(--text-primary)] font-medium mt-1">Clarify plan differentiation on pricing page.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {[
            {
              icon: Target,
              title: "Intent-first analysis",
              body: "Every run maps user journey friction before proposing fixes.",
            },
            {
              icon: BarChart3,
              title: "Decision-ready scoring",
              body: "UX, conversion, monetization, and benchmark signals in one view.",
            },
            {
              icon: ShieldCheck,
              title: "Evidence over opinion",
              body: "Recommendations include concrete observations and implementation actions.",
            },
            {
              icon: Clock3,
              title: "Built for weekly ops",
              body: "Fast enough to run continuously, structured enough to share with teams.",
            },
          ].map((item) => (
            <div key={item.title} className="app-surface p-4 md:p-5 hover-lift animate-fade-up">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
                <item.icon size={18} className="text-amber-300" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1.5">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="app-surface-strong p-6 md:p-8 text-center relative overflow-hidden hover-lift animate-fade-up">
          <Image
            src="/illustrations/analysis-sticker.svg"
            alt="GrowthLens sticker visual"
            width={360}
            height={360}
            className="hidden md:block absolute -left-8 bottom-0 w-40 h-40 object-contain opacity-70 animate-float-soft"
          />
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">Get started</p>
          <h2 className="text-heading text-2xl md:text-3xl text-[var(--text-primary)]">
            Run your first analysis in under two minutes.
          </h2>
          <p className="text-[var(--text-muted)] mt-2 max-w-2xl mx-auto">
            Start with one product URL. GrowthLens returns prioritized fixes by impact and effort.
          </p>
          <div className="mt-6">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[#18120a] font-semibold px-6 py-3 rounded-[var(--radius-sm)] hover:bg-[var(--accent-light)] transition-colors"
            >
              Create account
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-6 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--text-muted)]">
          <Logo />
          <p className="font-mono text-xs">Built for SaaS growth teams</p>
        </div>
      </footer>
    </div>
  );
}
