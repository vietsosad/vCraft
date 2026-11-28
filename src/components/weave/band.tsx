import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { bandVars, type Hue } from "./loom";

export function Band({
  hue,
  weight = "normal",
  tone = "dye",
  as: Tag = "section",
  className,
  bodyClassName,
  children,
  label,
}: {
  hue: Hue;
  weight?: "normal" | "light";
  tone?: "dye" | "quiet";
  as?: "section" | "header" | "div";
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <Tag
      aria-label={label}
      data-hue={hue}
      data-weight={weight}
      data-tone={tone === "quiet" ? "quiet" : undefined}
      className={cn("band", className)}
      style={tone === "quiet" ? bandVars(hue) : undefined}
    >
      <div className={cn("band-body account-container", bodyClassName)}>{children}</div>
    </Tag>
  );
}

export function BandHead({
  hue,
  title,
  description,
  count,
  actions,
}: {
  hue: Hue;
  title: ReactNode;
  description?: ReactNode;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <Band hue={hue} tone="quiet" as="header" className="account-subhead">
      <div className="max-w-3xl">
        <div className="account-hero-rule" aria-hidden><span /></div>
        <h1 className="giong-ke flex flex-wrap items-baseline gap-x-2.5">
          {count !== undefined && count > 0 && <span className="account-subhead-count">{count}</span>}
          <span>{title}</span>
        </h1>
        {description && <p className="soft mt-2 max-w-2xl leading-relaxed">{description}</p>}
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </Band>
  );
}
