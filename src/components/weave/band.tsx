import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { bandVars, motifUrl, type Hue, type MotifName } from "./loom";

/**
 * Một dải dệt chạy hết bề ngang: màu nhuộm đặc, hoa văn tông-trên-tông ở hai mép, biên răng cưa.
 * `weight`: việc gấp dệt dày (heavy), việc đã xong dệt mảnh (light).
 * `tone="quiet"`: dải nhẹ cho phần lịch sử – nền vải trơn, một vạch màu nấc ở mép trên, không hoa văn, không răng cưa.
 */
export function Band({
  hue,
  motif,
  weight = "normal",
  tone = "dye",
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
  tone?: "dye" | "quiet";
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
      data-tone={tone === "quiet" ? "quiet" : undefined}
      className={cn("band", className)}
      style={bandVars(hue, motif) as CSSProperties}
    >
      {tone === "dye" && (edges === "both" || edges === "top") && <div className="band-edge" aria-hidden />}
      <div className={cn("band-body mx-auto max-w-6xl px-4 md:px-8", bodyClassName)}>{children}</div>
      {tone === "dye" && (edges === "both" || edges === "bottom") && <div className="band-edge flip" aria-hidden />}
    </Tag>
  );
}

/**
 * Đầu trang của một mục: dải màu của mục, tiêu đề → lời dẫn ngắn → thao tác. Khi có số việc, con số đứng liền
 * trước tên cùng cỡ chữ ("3 đơn sỉ đang dệt"); khi bằng không thì không hiện số.
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
    <Band hue={hue} weight="normal" as="header" edges="bottom" bodyClassName="pt-8 pb-7 lg:pt-12">
      <div className="max-w-3xl">
        <h1 className="flex flex-wrap items-baseline gap-x-2.5">
          {count !== undefined && count > 0 && <span className="so">{count}</span>}
          <span>{title}</span>
        </h1>
        {description && <p className="soft mt-2 max-w-2xl leading-relaxed">{description}</p>}
        {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
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
