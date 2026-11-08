import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/** Thanh bước cho biểu mẫu nhiều bước và luồng trạng thái. */
export function Stepper({ steps, current, tone = "terracotta" }: { steps: string[]; current: number; tone?: "terracotta" | "cobalt" }) {
  const active = tone === "cobalt" ? "bg-cobalt text-kaolin border-cobalt" : "bg-terracotta text-kaolin border-terracotta";
  const done = tone === "cobalt" ? "bg-cobalt/15 text-cobalt border-cobalt/30" : "bg-terracotta/15 text-terracotta border-terracotta/30";
  return (
    <ol className="flex items-start" aria-label="Tiến trình">
      {steps.map((label, i) => (
        <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
          {i > 0 && <span className={cn("absolute right-1/2 top-4 h-[2px] w-full -translate-y-1/2", i <= current ? (tone === "cobalt" ? "bg-cobalt" : "bg-terracotta") : "bg-line")} aria-hidden />}
          <span className={cn("relative z-10 grid size-8 place-items-center rounded-full border-2 font-mono text-xs", i < current ? done : i === current ? active : "border-line bg-kaolin text-ash")}>
            {i < current ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("mt-2 px-1 text-[11px] leading-tight sm:text-xs", i === current ? "font-semibold text-ink" : "text-ash")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
