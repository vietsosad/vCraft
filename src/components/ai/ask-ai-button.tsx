"use client";

import { Sparkles } from "lucide-react";
import { askConcierge } from "./concierge-drawer";
import { cn } from "@/lib/cn";

/** Nút mở trợ lý AI với câu hỏi soạn sẵn theo ngữ cảnh trang. */
export function AskAiButton({ question, label = "Hỏi Sứ giả AI", className }: { question: string; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => askConcierge(question)}
      className={cn("inline-flex items-center gap-1.5 rounded-full border border-cobalt/30 px-3.5 py-2 text-sm text-cobalt transition hover:bg-cobalt hover:text-kaolin", className)}
    >
      <Sparkles className="size-4" /> {label}
    </button>
  );
}
