"use client";

import React from "react";
import { useToastStore, type ToastVariant } from "@/stores/toast";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  info: <Info size={16} className="text-sky-400" />,
};

const borderColors: Record<ToastVariant, string> = {
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  warning: "border-amber-500/30",
  info: "border-sky-500/30",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] border ${borderColors[t.variant]} bg-[var(--bg-deep)]/95 backdrop-blur-md shadow-lg shadow-black/30 animate-slide-in-right`}
        >
          <span className="mt-0.5 shrink-0">{icons[t.variant]}</span>
          <p className="text-sm text-[var(--text-secondary)] flex-1 leading-snug">
            {t.message}
          </p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors text-[var(--text-dim)]"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
