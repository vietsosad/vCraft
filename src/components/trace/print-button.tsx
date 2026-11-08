"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "In chứng nhận" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="no-print mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-bisque">
      <Printer className="size-4" /> {label}
    </button>
  );
}
