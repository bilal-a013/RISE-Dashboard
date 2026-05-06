"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, Loader2, X } from "lucide-react";
import { cn } from "./utils";

type ToastVariant = "success" | "error" | "info" | "loading";
type ToastInput = { title: string; description?: string; variant?: ToastVariant; duration?: number };
type Toast = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const next = { ...input, id };
      setToasts((current) => [...current, next]);
      if ((input.variant ?? "success") !== "loading") {
        timers.current[id] = setTimeout(() => dismiss(id), input.duration ?? 3200);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => () => {
    Object.values(timers.current).forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3 px-2 sm:right-6 sm:top-6">
        {toasts.map((item) => {
          const icon =
            item.variant === "error"
              ? AlertCircle
              : item.variant === "loading"
                ? Loader2
                : item.variant === "info"
                  ? Info
                  : CheckCircle2;
          return (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-xl transition-all duration-200 animate-rise-toast dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                item.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
                item.variant === "error" && "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100",
                item.variant === "info" && "border-[#c7c4d7] bg-[#f5f2fe] text-[#1b1b23] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                item.variant === "loading" && "border-[#c7c4d7] bg-white text-[#1b1b23] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              )}
            >
              {(() => {
                const Icon = icon;
                return <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", item.variant === "loading" && "animate-spin")} />;
              })()}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm leading-5 opacity-90">{item.description}</p> : null}
              </div>
              <button type="button" onClick={() => dismiss(item.id)} className="rounded-full p-1 opacity-60 transition hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
