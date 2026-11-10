import Link from "next/link";
import { cn } from "@/lib/cn";

/** Dấu hiệu vCraft: viên gốm men lam, nét "v" là dáng chén nhìn nghiêng, gạch đất nung là chân đế. */
export function LogoMark({ className, tone = "lam" }: { className?: string; tone?: "lam" | "datnung" | "ngoc" }) {
  const fill = tone === "datnung" ? "#8f3f1d" : tone === "ngoc" ? "#2f5c4d" : "#1f4e9a";
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9 shrink-0", className)} aria-hidden>
      <rect width="40" height="40" rx="6" fill={fill} />
      <path d="M2 2h36" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" />
      <path d="M9 12c3 0 4.5 1 6.2 5.6L20 29l4.8-11.4C26.5 13 28 12 31 12" fill="none" stroke="#fffdf8" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 32h14" stroke={tone === "datnung" ? "#f3c8a8" : "#ee8a43"} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false, tone = "lam", sub = "Làng gốm Bát Tràng", href = "/", className }: { compact?: boolean; tone?: "lam" | "datnung" | "ngoc"; sub?: string; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="vCraft – về trang chủ">
      <LogoMark tone={tone} className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6" />
      {!compact && (
        <span className="leading-none">
          <span className="block font-serif text-[1.55rem] font-extrabold tracking-tight">
            v<span className="text-datnung">Craft</span>
          </span>
          <span className="mt-0.5 hidden text-[10.5px] font-semibold tracking-wide text-tro sm:block">{sub}</span>
        </span>
      )}
    </Link>
  );
}
