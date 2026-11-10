"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const MAX = 1400;
const HOT = 1200;

/**
 * Giá trị bám theo đích bằng mô hình lò xo có khối lượng và giảm chấn (như kim đồng hồ đo nhiệt thật):
 * kim không nhảy tức thì mà vươn tới, hơi vọt qua rồi dừng. Người dùng giảm chuyển động thì nhảy thẳng.
 */
function useBallistic(target: number) {
  const [value, setValue] = useState(target);
  const state = useRef({ x: target, v: 0 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      state.current = { x: target, v: 0 };
      setValue(target);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const k = 70; // độ cứng
    const c = 11; // giảm chấn (nhỏ hơn 2√k → hơi vọt qua đích)
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = state.current;
      const a = k * (target - s.x) - c * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
      setValue(s.x);
      if (Math.abs(target - s.x) > 0.5 || Math.abs(s.v) > 0.5) raf = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function polar(cx: number, cy: number, r: number, t: number) {
  // t ∈ [0,1] trên cung 240° (từ -210° tới 30°)
  const a = ((-210 + 240 * t) * Math.PI) / 180;
  // làm tròn để server và trình duyệt cho cùng chuỗi số (tránh lệch hydrate do sai số dấu phẩy động)
  return [Math.round((cx + r * Math.cos(a)) * 100) / 100, Math.round((cy + r * Math.sin(a)) * 100) / 100] as const;
}

function arc(cx: number, cy: number, r: number, t0: number, t1: number) {
  const [x0, y0] = polar(cx, cy, r, t0);
  const [x1, y1] = polar(cx, cy, r, t1);
  return `M${x0},${y0} A${r},${r} 0 ${t1 - t0 > 0.75 ? 1 : 0} 1 ${x1},${y1}`;
}

/** Đồng hồ nhiệt lò: mặt số men ngà, vạch mực, cung đỏ lửa chỉ ở vùng trên 1.200°C. */
export function KilnGauge({ temp, stage, step, total, variant = "dial", className }: { temp: number; stage: string; step: number; total: number; variant?: "dial" | "bar"; className?: string }) {
  const v = Math.max(0, Math.min(MAX + 60, useBallistic(temp)));
  const t = v / MAX;
  const hot = v >= HOT;

  if (variant === "bar") {
    return (
      <div className={cn("rounded-[8px] border border-vua bg-su/95 px-4 py-2.5 shadow-soft backdrop-blur", className)} aria-live="polite">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="truncate font-semibold">{step}/{total} · {stage}</span>
          <span className={cn("font-display text-xl tabular", hot ? "text-datnung" : "text-muc")}>{Math.round(Math.max(0, v))}°C</span>
        </div>
        <div className="relative mt-1.5 h-2 rounded-full bg-nga-sau">
          <div className="absolute inset-y-0 rounded-r-full bg-datnung/25" style={{ left: `${(HOT / MAX) * 100}%`, right: 0 }} aria-hidden />
          <div className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-muc" style={{ left: `calc(${Math.min(1, t) * 100}% - 1.5px)` }} aria-hidden />
        </div>
      </div>
    );
  }

  const cx = 100, cy = 100, r = 78;
  const [nx, ny] = polar(cx, cy, r - 14, Math.min(1.04, t));
  const ticks = Array.from({ length: 15 }, (_, i) => i / 14);

  return (
    <figure className={cn("tile bg-su p-3 text-center", className)} aria-live="polite">
      <svg viewBox="0 0 200 168" className="mx-auto w-full max-w-[220px]" role="img" aria-label={`Nhiệt độ công đoạn ${stage}: ${Math.round(temp)} độ C`}>
        <path d={arc(cx, cy, r, 0, 1)} fill="none" stroke="var(--color-nga-sau)" strokeWidth={10} strokeLinecap="round" />
        <path d={arc(cx, cy, r, HOT / MAX, 1)} fill="none" stroke="var(--chart-2)" strokeWidth={10} strokeLinecap="round" opacity={hot ? 1 : 0.45} style={{ transition: "opacity .4s" }} />
        {ticks.map((k, i) => {
          const [x0, y0] = polar(cx, cy, r - 9, k);
          const [x1, y1] = polar(cx, cy, r - (i % 2 === 0 ? 18 : 14), k);
          const [lx, ly] = polar(cx, cy, r - 28, k);
          return (
            <g key={i}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--color-muc)" strokeOpacity={0.55} strokeWidth={i % 2 === 0 ? 1.4 : 0.8} />
              {i % 4 === 0 && <text x={lx} y={ly + 3} textAnchor="middle" className="fill-tro text-[8px]">{Math.round(k * MAX)}</text>}
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--color-muc)" strokeWidth={2.4} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill="var(--color-datnung)" stroke="var(--color-su)" strokeWidth={2} />
        <text x={cx} y={cy + 34} textAnchor="middle" className={cn("font-display text-[24px]", hot ? "fill-datnung" : "fill-muc")}>{Math.round(Math.max(0, v))}°C</text>
      </svg>
      <figcaption className="-mt-3 px-1 text-xs leading-snug">
        <span className="block text-tro">Công đoạn {step}/{total}</span>
        <span className="block font-semibold">{stage}</span>
      </figcaption>
    </figure>
  );
}
