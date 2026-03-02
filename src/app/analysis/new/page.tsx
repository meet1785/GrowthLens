import { AnalysisForm } from "@/components/analysis/AnalysisForm";

export default function NewAnalysisPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">
          Analysis
        </p>
        <h1 className="text-heading text-2xl md:text-3xl text-[var(--text-primary)]">
          Start a new analysis
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 max-w-2xl">
          Use one URL per run so the report stays clear, attributable, and actionable.
        </p>
      </div>
      <AnalysisForm />
    </div>
  );
}
