"use client";

import React, { useState } from "react";
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
    <Card className="max-w-2xl mx-auto glow-amber animate-scale-in">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Analyze a Product
          </h2>
          <p className="text-[var(--text-muted)] mt-1.5 text-sm">
            Enter a website URL to get a comprehensive growth analysis powered by
            AI
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
            {isLoading ? "Starting Analysis..." : "Analyze Website"}
            {!isLoading && <ArrowRight size={18} />}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-dim)] text-center font-mono">
            Analysis typically takes 30–90 seconds. We&apos;ll crawl key pages and
            run AI analysis across UX, conversion, monetization, and benchmarks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
