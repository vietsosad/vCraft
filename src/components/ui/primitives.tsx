import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "terracotta" | "cobalt" | "celadon" | "gold" | "ash" | "ink";

const tones: Record<Tone, string> = {
  terracotta: "bg-terracotta/10 text-terracotta ring-terracotta/25",
  cobalt: "bg-cobalt/10 text-cobalt ring-cobalt/25",
  celadon: "bg-celadon/12 text-celadon ring-celadon/30",
  gold: "bg-kiln/12 text-[#9a5300] ring-kiln/30",
  ash: "bg-ash/10 text-ash ring-ash/25",
  ink: "bg-ink text-kaolin ring-ink",
};

export function Badge({
  tone = "ash",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[(tone as Tone) in tones ? (tone as Tone) : "ash"],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-tile)] border border-line bg-white/70 shadow-soft", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[var(--radius-tile)] bg-bisque-deep/70", className)} aria-hidden />;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="crackle-bg flex flex-col items-center justify-center rounded-[var(--radius-tile)] border border-dashed border-line px-6 py-14 text-center">
      {icon && <div className="mb-3 text-terracotta">{icon}</div>}
      <p className="font-display text-2xl">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-ash">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl md:text-[2.6rem]">{title}</h2>
        {description && <p className="mt-3 text-ash">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Con dấu "Hộ nghề xác thực" – triện đỏ gạch của BQL. */
export function VerifiedSeal({ className, label = "Hộ nghề xác thực" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border-[1.5px] border-terracotta px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-terracotta",
        className,
      )}
      title="Đã được Ban quản lý làng nghề Bát Tràng xác thực"
    >
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden>
        <path d="M8 1.5 9.8 3l2.3-.2.6 2.2 2 1.2-.9 2.1.9 2.1-2 1.2-.6 2.2-2.3-.2L8 14.5 6.2 13l-2.3.2-.6-2.2-2-1.2.9-2.1-.9-2.1 2-1.2.6-2.2L6.2 3z" fill="currentColor" opacity=".18" />
        <path d="m5.2 8.2 1.9 1.9 3.7-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-tile)] border border-line bg-white/70 p-5">
      <p className="text-sm text-ash">{label}</p>
      <p className="mt-1 font-display text-4xl tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-ash">{hint}</p>}
    </div>
  );
}
