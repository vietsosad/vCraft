"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { TramIcon, type TramKind } from "./glyphs";

/** Tọa độ sáu điểm dừng trên bản đồ (khung 1200 × 380), nối bằng con đường gạch uốn lượn. */
const TRAM = [
  { x: 90, y: 250 }, { x: 300, y: 150 }, { x: 510, y: 270 },
  { x: 720, y: 160 }, { x: 920, y: 270 }, { x: 1110, y: 170 },
];
const DUONG = "M90,250 C160,250 230,150 300,150 C370,150 440,270 510,270 C580,270 650,160 720,160 C790,160 850,270 920,270 C990,270 1040,170 1110,170";
/** Người lữ khách dừng chân cạnh biển điểm dừng (lệch theo con đường), đứng trước tấm biển chứ không khuất sau nó. */
const LECH = 96;

export type Station = { label: string; sub: string; icon: TramKind; count?: number };
type Pos = { x: number; y: number; hop: number; dir: 1 | -1 };

/**
 * Đường làng: sáu điểm dừng, mỗi điểm là một việc của khách với làng. Chọn một điểm, người lữ khách đội nón lá
 * (xách đèn lồng) đi theo đúng con đường gạch tới đó, quay mặt theo hướng đi, rồi nội dung của điểm ấy mở ra bên dưới.
 * Trên điện thoại, con đường thành dải điểm dừng cuộn ngang. Giảm chuyển động: người lữ khách đứng sẵn ở điểm mới.
 */
export function VillageRoad({ stations, panels, initial = 0 }: { stations: Station[]; panels: ReactNode[]; initial?: number }) {
  const reduce = useReducedMotion();
  const [station, setStation] = useState(initial);
  const [pos, setPos] = useState<Pos>({ x: TRAM[initial]!.x + LECH * 0.7, y: TRAM[initial]!.y, hop: 0, dir: 1 });
  const path = useRef<SVGPathElement>(null);
  const lens = useRef<number[] | null>(null);
  const raf = useRef(0);
  const nut = useRef<(HTMLButtonElement | null)[]>([]);

  /** Độ dài trên con đường tại chỗ người lữ khách đứng ở từng điểm dừng. */
  function measure(p: SVGPathElement) {
    const total = p.getTotalLength();
    return TRAM.map((s, i) => {
      let best = 0, bd = Infinity;
      for (let l = 0; l <= total; l += 2) {
        const q = p.getPointAtLength(l);
        const d = (q.x - s.x) ** 2 + (q.y - s.y) ** 2;
        if (d < bd) { bd = d; best = l; }
      }
      return i === TRAM.length - 1 ? Math.max(0, best - LECH) : Math.min(total, best + LECH);
    });
  }
  function standAt(i: number): { x: number; y: number } {
    const p = path.current;
    try {
      if (p) {
        lens.current ??= measure(p);
        const pt = p.getPointAtLength(lens.current[i]!);
        return { x: pt.x, y: pt.y };
      }
    } catch { /* bản đồ chưa dựng (ẩn trên điện thoại) */ }
    return TRAM[i]!;
  }

  useEffect(() => {
    setPos((cur) => ({ ...cur, ...standAt(initial), hop: 0 }));
    return () => cancelAnimationFrame(raf.current);
    // chỉ đặt chỗ đứng ban đầu một lần sau khi con đường đã dựng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(i: number) {
    if (i === station) return;
    const from = station;
    setStation(i);
    const p = path.current;
    const dir: 1 | -1 = i > from ? 1 : -1;
    // dải cuộn ngang trên điện thoại không vẽ con đường: người lữ khách đứng sẵn ở điểm mới
    if (!p || reduce || !p.getBoundingClientRect().width) { setPos({ ...standAt(i), hop: 0, dir }); return; }
    lens.current ??= measure(p);
    const a = lens.current[from]!, b = lens.current[i]!;
    const dur = Math.min(1500, 500 + Math.abs(b - a) * 0.9);
    const t0 = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const pt = p.getPointAtLength(a + (b - a) * e);
      setPos({ x: pt.x, y: pt.y, hop: Math.abs(Math.sin(k * Math.PI * 6)) * (1 - k), dir });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  /** ← → đi sang điểm dừng bên cạnh, Home/End về đầu/cuối đường (Tab vẫn đi qua từng điểm như thường). */
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const n = stations.length;
    const next = e.key === "ArrowRight" ? (station + 1) % n : e.key === "ArrowLeft" ? (station - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (next === null || !(e.target instanceof HTMLButtonElement)) return;
    e.preventDefault();
    go(next);
    nut.current[next]?.focus();
  }

  return (
    <div>
      <div className="rounded-[12px] border border-vua bg-su p-3 shadow-soft md:p-5">
        <div className="ban-do relative aspect-[1200/380]">
          <svg className="ban-do-ve absolute inset-0 size-full" viewBox="0 0 1200 380" aria-hidden>
            <defs>
              <pattern id="lang-may-ban-do" width="48" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 12 Q12 3 24 12 T48 12" fill="none" stroke="var(--color-lam)" strokeWidth="1.3" opacity=".35" />
              </pattern>
            </defs>
            <rect x="0" y="330" width="1200" height="50" fill="url(#lang-may-ban-do)" />
            <g fill="var(--color-ngoc-nhat)">
              <circle cx="190" cy="90" r="22" /><circle cx="214" cy="96" r="16" /><circle cx="640" cy="320" r="20" /><circle cx="664" cy="314" r="14" />
              <circle cx="1010" cy="96" r="24" /><circle cx="1036" cy="104" r="15" /><circle cx="400" cy="72" r="16" /><circle cx="820" cy="340" r="18" />
            </g>
            <path d={DUONG} fill="none" className="f-road-s" strokeWidth="30" strokeLinecap="round" />
            <path d={DUONG} fill="none" stroke="var(--color-datnung)" strokeWidth="20" strokeDasharray="12 5" opacity=".22" />
            <path ref={path} d={DUONG} fill="none" stroke="var(--color-vua)" strokeWidth="1.5" strokeDasharray="3 7" />
            <g fill="var(--color-su)" stroke="var(--color-lam)" strokeWidth="3">
              {TRAM.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r="8" fill={i === station ? "var(--color-lam)" : undefined} />)}
            </g>
          </svg>

          <div className="tram-hang absolute inset-0" role="group" aria-label="Các điểm dừng trên đường làng (dùng phím mũi tên trái phải để đi)" onKeyDown={onKey}>
            {stations.map((s, i) => (
              <button key={s.label} ref={(el) => { nut.current[i] = el; }} type="button" className={`tram tram-${i + 1}`} aria-pressed={i === station} aria-controls="diem-dung" onClick={() => go(i)}>
                <span className="tram-icon"><TramIcon kind={s.icon} /></span>
                <span className="font-serif text-[1.05rem] font-bold leading-tight giong-ke">{s.label}</span>
                <span className="text-[13px] text-tro">{s.sub}</span>
                {s.count ? <span className="tram-dem" aria-hidden>{s.count > 9 ? "9+" : s.count}</span> : null}
              </button>
            ))}
          </div>

          {/* người lữ khách đội nón lá, xách đèn lồng: lớp trên cùng, đứng trước các tấm biển */}
          <svg className="ban-do-ve pointer-events-none absolute inset-0 size-full" viewBox="0 0 1200 380" aria-hidden>
            <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)}) scale(${pos.dir} 1)`}>
              <ellipse cx="0" cy="4" rx="16" ry="5" fill="#1c1a17" opacity=".18" />
              <g transform={`translate(0 ${(-pos.hop * 7).toFixed(1)})`}>
                <path d="M-7 0 L-5 -22 H5 L7 0 Z" fill="#1f4e9a" />
                <circle cx="0" cy="-28" r="6" fill="#e9c9a6" />
                <path d="M-17 -30 L0 -46 L17 -30 Q0 -26 -17 -30 Z" fill="#c8962e" stroke="#84600f" strokeWidth="1" />
                <path d="M5 -16 L16 -10" stroke="#5a3323" strokeWidth="1.6" strokeLinecap="round" />
                <g className="den-lac">
                  <path d="M16 -10 v4" stroke="#5a3323" strokeWidth="1.2" />
                  <ellipse cx="16" cy="-1" rx="4.5" ry="6" fill="#d9502e" />
                  <circle cx="16" cy="-1" r="11" fill="#ffb56b" className="ho-hap" opacity=".35" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div id="diem-dung" role="region" aria-label={stations[station]?.label} className="mt-7">
        <div key={station} className="hien">{panels[station]}</div>
      </div>
    </div>
  );
}
