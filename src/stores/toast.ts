"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant = "info", duration = 4000) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/** Convenience helpers */
export const toast = {
  success: (msg: string) => useToastStore.getState().addToast(msg, "success"),
  error: (msg: string) => useToastStore.getState().addToast(msg, "error", 6000),
  info: (msg: string) => useToastStore.getState().addToast(msg, "info"),
  warning: (msg: string) => useToastStore.getState().addToast(msg, "warning", 5000),
};
