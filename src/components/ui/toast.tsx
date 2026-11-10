"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; title: string; description?: string };

const ToastContext = createContext<{ push: (t: Omit<ToastItem, "id">) => void } | null>(null);

/** Thông báo nổi (toast) – phản hồi tức thì sau mỗi thao tác mà không tải lại trang. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), t.kind === "error" ? 7000 : 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[1000] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto relative flex animate-rise items-start gap-3 overflow-hidden rounded-[8px] border bg-su p-4 shadow-lift",
              t.kind === "success" && "border-ngoc/40",
              t.kind === "error" && "border-doson/45",
              t.kind === "info" && "border-lam/30",
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ngoc" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 size-5 shrink-0 text-doson" />}
            {t.kind === "info" && <Info className="mt-0.5 size-5 shrink-0 text-lam" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] text-tro">{t.description}</p>}
            </div>
            <button
              aria-label="Đóng thông báo"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-tro hover:text-muc"
            >
              <X className="size-4" />
            </button>
            {/* Vạch thời gian: co dần cho tới khi thông báo tự đóng */}
            <span
              aria-hidden
              className={cn("absolute inset-x-0 bottom-0 h-[3px] origin-left", t.kind === "success" ? "bg-ngoc" : t.kind === "error" ? "bg-doson" : "bg-lam")}
              style={{ animation: `toast-drain ${t.kind === "error" ? 7000 : 4500}ms linear forwards` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast phải nằm trong ToastProvider");
  return ctx.push;
}
