"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastType = "success" | "error";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = globalThis.crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3800);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 lg:pl-64"
      >
        <div className="flex w-full max-w-md flex-col items-center gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md ${
                toast.type === "success"
                  ? "border-line bg-surface/95 text-ink"
                  : "border-danger-line bg-danger-bg/95 text-danger"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
              )}

              <p className="min-w-0 flex-1 text-xs font-medium">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="rounded-md p-1 text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  }
  return context;
}