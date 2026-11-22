import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { bandVars, motifUrl, type Hue, type MotifName } from "./loom";

/** Con thoi gỗ: chạy qua mép dưới dải một lần khi dải vừa dệt xong. */
export function Shuttle() {
  return (
    <svg viewBox="0 0 56 14" className="shuttle" aria-hidden focusable="false">
      <path d="M1 7 C 10 1.5, 46 1.5, 55 7 C 46 12.5, 10 12.5, 1 7 Z" fill="#c9893a" />
      <path d="M1 7 C 10 1.5, 46 1.5, 55 7" fill="none" stroke="#7a4a17" strokeWidth="0.8" />
      <rect x="21" y="5" width="14" height="4" rx="1.5" fill="#5a3410" />
    </svg>
  );
}

/**
 * Một dải dệt chạy hết bề ngang: màu nhuộm đặc, hoa văn tông-trên-tông, biên răng cưa trên dưới.
 * `weight`: việc gấp dệt dày (heavy), việc đã xong dệt mảnh (light).
 */
export function Band({
  hue,
  motif,
  weight = "normal",
  as: Tag = "section",
  className,
  bodyClassName,
  edges = "both",
  children,
  label,
  id,
}: {
  hue: Hue;
  motif?: MotifName;
  weight?: "heavy" | "normal" | "light";
  as?: "section" | "header" | "div";
  className?: string;
  bodyClassName?: string;
  edges?: "both" | "top" | "bottom" | "none";
  children: ReactNode;
  label?: string;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      aria-label={label}
      data-hue={hue}
      data-weight={weight}
      data-reveal="weave"
      className={cn("band", className)}
      style={bandVars(hue, motif) as CSSProperties}
    >
      {(edges === "both" || edges === "top") && <div className="band-edge" aria-hidden />}
      <div className={cn("band-body mx-auto max-w-6xl px-4 md:px-8", bodyClassName)}>{children}</div>
      {(edges === "both" || edges === "bottom") && <div className="band-edge flip" aria-hidden />}
      <Shuttle />
    </Tag>
  );
}

/**
 * Đầu trang của một mục: dải dày màu của mục, tên lớn và lời dẫn. Khi có số việc, con số dệt liền vào tên
 * ("3 Đơn sỉ"); khi bằng không thì không hiện số, thao tác chính thay chỗ.
 */
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
    <Band hue={hue} weight="heavy" as="header" edges="bottom">
      <div className="max-w-3xl">
        <h1 className="flex flex-wrap items-baseline gap-x-4 text-[clamp(2.3rem,5vw,3.6rem)]">
          {count !== undefined && count > 0 && <span className="so text-[1.45em]">{count}</span>}
          <span>{title}</span>
        </h1>
        {description && <p className="soft mt-3 max-w-2xl text-[1.02rem] leading-relaxed">{description}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </Band>
  );
}

/** Lớp hoa văn đặc dùng cho đoạn tiến độ đã dệt kín. */
export function motifOn(name: MotifName) {
  return { "--motif-on": motifUrl(name, "rgba(255,255,255,0.22)", 2) } as CSSProperties;
}

/** Tua vải ở cuối tấm. */
export function Fringe() {
  return <div className="fringe" aria-hidden />;
}
