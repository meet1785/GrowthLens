"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AnalysisProgress {
  status: string;
  progress: number;
  currentStage: string | null;
  error: string | null;
}

export function useAnalysisPolling(
  analysisId: string | null,
  options?: { interval?: number; enabled?: boolean }
) {
  const { interval = 2000, enabled = true } = options ?? {};
  const [progress, setProgress] = useState<AnalysisProgress>({
    status: "pending",
    progress: 0,
    currentStage: null,
    error: null,
  });
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(async () => {
    if (!analysisId) return;

    try {
      const res = await fetch(`/api/analysis/${analysisId}/status`);
      const data = await res.json();

      if (data.success) {
        setProgress(data.data);
        if (
          data.data.status === "completed" ||
          data.data.status === "failed"
        ) {
          setIsComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch {
      // Silently retry on network error
    }
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId || !enabled) return;

    // Initial check
    checkStatus();

    // Start polling
    intervalRef.current = setInterval(checkStatus, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [analysisId, enabled, interval, checkStatus]);

  return { ...progress, isComplete };
}
