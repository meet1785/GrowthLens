"use client";

import { useState, useCallback } from "react";

interface UseAnalysisReturn {
  startAnalysis: (url: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useStartAnalysis(): UseAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (url: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to start analysis");
        return null;
      }

      return data.data.id;
    } catch (err) {
      setError("Network error. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { startAnalysis, isLoading, error };
}
