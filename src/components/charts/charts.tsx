"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Biểu đồ SVG viết tay theo quy tắc của bộ màu đã kiểm định (mù màu & tương phản):
 * cột ≤ 24px, đầu cột bo 4px, gốc vuông; lưới mảnh 1px; khe 2px màu nền giữa các đoạn chồng;
 * chữ luôn dùng màu chữ (không dùng màu dữ liệu); có tooltip khi rê/focus và bảng số liệu đi kèm.
 * Màu chuỗi lấy từ biến --chart-1..4 (có bản riêng cho chế độ tối).
 */

const nf = new Intl.NumberFormat("vi-VN");
const compact = (v: number) => (v >= 1_000_000_000 ? `${nf.format(Math.round(v / 1e8) / 10)} tỷ` : v >= 1_000_000 ? `${nf.format(Math.round(v / 1e5) / 10)} tr` : v >= 10_000 ? `${nf.format(Math.round(v / 100) / 10)}K` : nf.format(v));

function niceMax(v: number) {
  if (v <= 0) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10;
  return step * pow;
}

/** Hiện dần khi cuộn tới: cột mọc từ đường gốc. */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setInView(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function Tooltip({ x, y, title, rows }: { x: number; y: number; title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-[6px] border border-vua bg-su px-3 py-2 text-xs shadow-lift"
      style={{ left: x, top: y }}
    >
      <p className="mb-1 text-tro">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          {r.color && <span className="h-0.5 w-3 rounded-full" style={{ background: r.color }} aria-hidden />}
          <span className="font-semibold tabular text-muc">{r.value}</span>
          <span className="text-tro">{r.label}</span>
        </p>
      ))}
    </div>
  );
}

function DataTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer text-xs font-semibold text-tro hover:text-muc">Xem bảng số liệu</summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-[6px] border border-vua">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-nga-dam">
            <tr>{headers.map((h) => <th key={h} className="px-3 py-1.5 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-vua">
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} className={cn("px-3 py-1.5", j > 0 && "tabular")}>{typeof c === "number" ? nf.format(c) : c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* --------------------------------------------------------------------------
 * Cột theo ngày (một chuỗi): lượt quét QR 30 ngày
 * ------------------------------------------------------------------------ */
export function DailyColumns({ data, label, unit = "lượt", color = "var(--chart-1)", height = 200 }: { data: { day: string; value: number }[]; label: string; unit?: string; color?: string; height?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const pad = { l: 34, r: 8, t: 18, b: 24 };
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const band = iw / data.length;
  const bw = Math.min(24, Math.max(3, band - 2));
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const peak = data.reduce((m, d, i) => (d.value > data[m].value ? i : m), 0);
  const fmtDay = (d: string) => `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`;

  return (
    <div ref={ref} className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-labelledby={id} className="overflow-visible">
        <title id={id}>{label}</title>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="var(--color-vua)" strokeWidth={1} />
            <text x={pad.l - 6} y={y(max * t) + 4} textAnchor="end" className="fill-tro text-[10px]">{compact(max * t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * band + (band - bw) / 2;
          const h = Math.max(0, (d.value / max) * ih);
          const r = Math.min(4, h);
          const top = pad.t + ih - h;
          return (
            <g key={d.day}>
              <path
                d={h > 0 ? `M${x},${pad.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${pad.t + ih} Z` : ""}
                fill={color}
                opacity={hover === null || hover === i ? 1 : 0.45}
                style={{ transformOrigin: `0 ${pad.t + ih}px`, transform: inView ? "scaleY(1)" : "scaleY(0)", transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 18}ms, opacity .2s` }}
              />
              <rect
                x={pad.l + i * band}
                y={pad.t}
                width={band}
                height={ih}
                fill="transparent"
                tabIndex={0}
                aria-label={`${fmtDay(d.day)}: ${d.value} ${unit}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="outline-none"
              />
            </g>
          );
        })}
        <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="var(--color-tro)" strokeOpacity={0.5} strokeWidth={1} />
        {data.map((d, i) => (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
          <text key={d.day} x={pad.l + i * band + band / 2} y={height - 6} textAnchor="middle" className="fill-tro text-[10px]">{fmtDay(d.day)}</text>
        ))}
        {data[peak].value > 0 && (
          <text x={pad.l + peak * band + band / 2} y={y(data[peak].value) - 6} textAnchor="middle" className="fill-muc text-[11px] font-semibold">{data[peak].value}</text>
        )}
      </svg>
      {hover !== null && (
        <Tooltip x={pad.l + hover * band + band / 2} y={y(data[hover].value)} title={`Ngày ${fmtDay(data[hover].day)}`} rows={[{ label: unit, value: nf.format(data[hover].value), color }]} />
      )}
      <DataTable caption={label} headers={["Ngày", `Số ${unit}`]} rows={data.map((d) => [fmtDay(d.day), d.value])} />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Cột chồng theo tuần (2 chuỗi): đăng ký mới khách hàng / hộ nghề
 * ------------------------------------------------------------------------ */
export function StackedColumns({
  data,
  series,
  label,
  height = 200,
}: {
  data: { x: string; values: number[] }[];
  series: { name: string; color: string }[];
  label: string;
  height?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [w, setW] = useState(520);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const pad = { l: 28, r: 8, t: 14, b: 24 };
  const totals = data.map((d) => d.values.reduce((a, b) => a + b, 0));
  const max = niceMax(Math.max(...totals));
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const band = iw / data.length;
  const bw = Math.min(24, band - 6);
  const unitH = ih / max;
  const fmtWeek = (d: string) => `${Number(d.slice(8))}/${Number(d.slice(5, 7))}`;

  return (
    <div ref={ref} className="relative">
      <ul className="mb-2 flex flex-wrap gap-4 text-xs text-tro" aria-label="Chú giải">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-[2px]" style={{ background: s.color }} aria-hidden />{s.name}</li>
        ))}
      </ul>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-labelledby={id} className="overflow-visible">
        <title id={id}>{label}</title>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih - max * t * unitH} y2={pad.t + ih - max * t * unitH} stroke="var(--color-vua)" strokeWidth={1} />
            <text x={pad.l - 6} y={pad.t + ih - max * t * unitH + 4} textAnchor="end" className="fill-tro text-[10px]">{nf.format(max * t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * band + (band - bw) / 2;
          let acc = 0;
          const top = d.values.reduce((last, v, k) => (v > 0 ? k : last), -1);
          return (
            <g key={d.x} opacity={hover === null || hover === i ? 1 : 0.45} style={{ transition: "opacity .2s" }}>
              {d.values.map((v, si) => {
                if (v <= 0) return null;
                const h = v * unitH - (si < top ? 2 : 0);
                const yb = pad.t + ih - acc * unitH;
                acc += v;
                const yt = yb - h;
                const r = si === top ? Math.min(4, h) : 0;
                return (
                  <path
                    key={si}
                    d={`M${x},${yb} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + bw - r} Q${x + bw},${yt} ${x + bw},${yt + r} V${yb} Z`}
                    fill={series[si].color}
                    style={{ transformOrigin: `0 ${pad.t + ih}px`, transform: inView ? "scaleY(1)" : "scaleY(0)", transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms` }}
                  />
                );
              })}
              <rect x={pad.l + i * band} y={pad.t} width={band} height={ih} fill="transparent" tabIndex={0} className="outline-none"
                aria-label={`Tuần ${fmtWeek(d.x)}: ${series.map((s, si) => `${d.values[si]} ${s.name}`).join(", ")}`}
                onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} />
              <text x={pad.l + i * band + band / 2} y={height - 6} textAnchor="middle" className="fill-tro text-[10px]">{fmtWeek(d.x)}</text>
            </g>
          );
        })}
        <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="var(--color-tro)" strokeOpacity={0.5} strokeWidth={1} />
      </svg>
      {hover !== null && (
        <Tooltip
          x={pad.l + hover * band + band / 2}
          y={pad.t + ih - totals[hover] * unitH}
          title={`Tuần từ ${fmtWeek(data[hover].x)}`}
          rows={series.map((s, si) => ({ label: s.name, value: nf.format(data[hover].values[si]), color: s.color }))}
        />
      )}
      <DataTable caption={label} headers={["Tuần", ...series.map((s) => s.name)]} rows={data.map((d) => [fmtWeek(d.x), ...d.values])} />
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Thanh ngang xếp hạng (một chuỗi): trạng thái đơn, xưởng dẫn đầu, lịch hẹn
 * ------------------------------------------------------------------------ */
export function BarList({ items, label, color = "var(--chart-1)", format = "number" }: { items: { label: string; value: number; hint?: string }[]; label: string; color?: string; format?: "number" | "vnd" }) {
  const { ref, inView } = useInView<HTMLUListElement>();
  const max = useMemo(() => Math.max(1, ...items.map((i) => i.value)), [items]);
  const fmt = (v: number) => (format === "vnd" ? `${compact(v)} ₫` : nf.format(v));
  return (
    <ul ref={ref} className="space-y-3" aria-label={label}>
      {items.map((it, i) => (
        <li key={it.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm">
          <span className="truncate text-muc" title={it.label}>{it.label}</span>
          <span className="relative h-[14px] rounded-r-[4px]" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 rounded-r-[4px]"
              style={{
                background: color,
                width: `${Math.max(it.value > 0 ? 2 : 0, (it.value / max) * 100)}%`,
                transform: inView ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms`,
              }}
            />
          </span>
          <span className="min-w-12 text-right font-semibold tabular">{fmt(it.value)}</span>
        </li>
      ))}
    </ul>
  );
}
