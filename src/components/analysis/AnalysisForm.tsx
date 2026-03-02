"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Globe, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useStartAnalysis } from "@/hooks/useAnalysis";

export function AnalysisForm() {
  const [url, setUrl] = useState("");
  const { startAnalysis, isLoading, error } = useStartAnalysis();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const analysisId = await startAnalysis(url.trim());
    if (analysisId) {
      router.push(`/analysis/${analysisId}`);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto animate-scale-in hover-lift soft-glow">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--accent-dim)] border border-amber-300/20 flex items-center justify-center mb-4 pulse-ring">
            <Globe className="w-6 h-6 text-amber-300" />
          </div>
          <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border-subtle)] mb-4">
            <Image
              src="/illustrations/analysis-sticker.svg"
              alt="Analysis sticker"
              width={360}
              height={360}
              className="w-full h-28 object-contain bg-[var(--bg-elevated)] animate-float-soft"
            />
          </div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-dim)] font-mono mb-2">
            New Mission
          </p>
          <h2 className="text-xl md:text-2xl text-heading text-[var(--text-primary)]">
            Run a growth audit
          </h2>
          <p className="text-[var(--text-muted)] mt-2 text-sm">
            Submit one product URL and we’ll return prioritized UX, conversion, and monetization fixes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="e.g. stripe.com or https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-base h-12"
            disabled={isLoading}
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isLoading}
          >
            {isLoading ? "Starting Analysis..." : "Start Analysis"}
            {!isLoading && <ArrowRight size={18} />}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs text-[var(--text-muted)]">
          <p className="app-surface px-3 py-2 rounded-[var(--radius-sm)] hover-lift">1. Crawl key pages</p>
          <p className="app-surface px-3 py-2 rounded-[var(--radius-sm)] hover-lift">2. Score core growth surfaces</p>
          <p className="app-surface px-3 py-2 rounded-[var(--radius-sm)] hover-lift">3. Generate ranked fixes</p>
        </div>
      </CardContent>
    </Card>
  );
}
