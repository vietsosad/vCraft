import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Thanh bước: mỗi bước là một viên gốm, mạch nối giữa các viên được "tráng men" dần
 * khi tiến trình đi qua. Viên hiện tại có vòng sáng lan nhẹ.
 */
export function Stepper({ steps, current, tone = "terracotta" }: { steps: string[]; current: number; tone?: "terracotta" | "cobalt" }) {
  const fill = tone === "cobalt" ? "bg-lam" : "bg-datnung";
  const active = tone === "cobalt" ? "bg-lam text-on" : "bg-datnung text-on";
  const done = tone === "cobalt" ? "bg-lam-nhat text-lam ring-1 ring-inset ring-lam/30" : "bg-datnung-nhat text-datnung ring-1 ring-inset ring-datnung/30";
  return (
    <ol className="flex items-start" aria-label="Tiến trình">
      {steps.map((label, i) => (
        <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
          {i > 0 && (
            <span className="absolute right-1/2 top-4 h-[3px] w-full -translate-y-1/2 overflow-hidden rounded-full bg-vua" aria-hidden>
              <span
                className={cn("block h-full origin-left transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", fill)}
                style={{ transform: `scaleX(${i <= current ? 1 : 0})`, transitionDelay: `${i * 90}ms` }}
              />
            </span>
          )}
          <span
            className={cn(
              "relative z-10 grid size-8 place-items-center rounded-[6px] text-xs font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-colors duration-500",
              i < current ? done : i === current ? active : "bg-su text-tro ring-1 ring-inset ring-vua",
            )}
          >
            {i === current && <span className={cn("absolute inset-0 -z-10 animate-pulse-ring rounded-[6px] opacity-40", fill)} aria-hidden />}
            {i < current ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("mt-2 px-1 text-[11px] leading-tight sm:text-xs", i === current ? "font-semibold text-muc" : "text-tro")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
