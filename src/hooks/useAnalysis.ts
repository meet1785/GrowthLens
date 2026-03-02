"use client";

import { useState, useCallback } from "react";
import { toast } from "@/stores/toast";

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
        const errMsg = data.error || "Failed to start analysis";
        setError(errMsg);
        toast.error(errMsg);
        return null;
      }

      toast.success("Analysis started — crawling in progress");
      return data.data.id;
    } catch {
      const errMsg = "Network error. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { startAnalysis, isLoading, error };
}
