import { AnalysisForm } from "@/components/analysis/AnalysisForm";

export default function NewAnalysisPage() {
  return (
    <div className="py-8 animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">New Analysis</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Enter a product website URL to start your growth analysis
        </p>
      </div>
      <AnalysisForm />
    </div>
  );
}
