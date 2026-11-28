"use client";

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Cảnh bến làng Bát Tràng: trời, mặt trời trống đồng, đê sông Hồng, nhà ngói, lò bầu tỏa khói, đình làng,
 * sông chảy sóng mây, thuyền chở gốm thật và khóm tre. Rê chuột thì các lớp xê dịch theo độ xa gần.
 * Chế độ tối của trang biến cảnh thành đêm hội đèn (sao, trăng, đèn lồng, lửa lò sáng hơn) – màu nằm trong lang.css.
 * Trên điện thoại, chữ nằm dưới tranh để không đè lên mái nhà.
 */
export function VillageScene({ heading, lead, actions, aside }: { heading: ReactNode; lead: ReactNode; actions?: ReactNode; aside?: ReactNode }) {
  const reduce = useReducedMotion();
  const [p, setP] = useState({ x: 0, y: 0 });
  const raf = useRef(0);

  function move(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setP({ x, y }));
  }
  const shift = (f: number, fy = f * 0.4): CSSProperties | undefined =>
    reduce ? undefined : { transform: `translate(${(p.x * f).toFixed(1)}px, ${(p.y * fy).toFixed(1)}px)` };

  return (
    <section aria-label="Bến làng gốm Bát Tràng" className="lang-scene md:h-[620px]" onPointerMove={move} onPointerLeave={() => setP({ x: 0, y: 0 })}>
      <div className="canh-ve relative h-[300px] md:absolute md:inset-0 md:h-auto" aria-hidden>
        <svg viewBox="0 0 1440 640" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 block size-full">
          <defs>
            <linearGradient id="lang-troi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="stop-sky-top" />
              <stop offset=".55" className="stop-sky-mid" />
              <stop offset="1" className="stop-sky-low" />
            </linearGradient>
            <linearGradient id="lang-nuoc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" className="stop-river" />
              <stop offset="1" className="stop-river-deep" />
            </linearGradient>
            <radialGradient id="lang-quang">
              <stop offset="0" className="stop-glow" stopOpacity=".9" />
              <stop offset="1" className="stop-glow" stopOpacity="0" />
            </radialGradient>
            <pattern id="lang-ngoi" width="16" height="7" patternUnits="userSpaceOnUse">
              <path d="M0 7 Q4 0 8 7 Q12 0 16 7" fill="none" className="s-roof-2" strokeWidth="1.2" />
            </pattern>
            <pattern id="lang-may-song" width="60" height="26" patternUnits="userSpaceOnUse">
              <path d="M0 16 Q15 4 30 16 T60 16" fill="none" className="s-wave" strokeWidth="1.6" opacity=".55" />
              <path d="M14 23 q6 -5 12 0" fill="none" className="s-wave" strokeWidth="1.2" opacity=".35" />
            </pattern>
          </defs>
          <rect width="1440" height="640" fill="url(#lang-troi)" />

          <g className="lop-sao" fill="#fffdf8">
            {[[120, 70, 1.6, 0], [260, 130, 1.2, 0.8], [430, 60, 1.8, 1.6], [610, 110, 1.2, 0.4], [780, 48, 1.5, 2.2], [900, 150, 1.1, 1.1], [1290, 80, 1.7, 2.8], [1380, 190, 1.2, 0.2], [980, 260, 1.1, 1.9], [340, 230, 1.3, 2.5]].map(([cx, cy, r, d]) => (
              <circle key={`${cx}-${cy}`} className="sao" cx={cx} cy={cy} r={r} style={{ animationDelay: `${d}s` }} />
            ))}
          </g>

          {/* mặt trời trống đồng (đêm: trăng) */}
          <g className="lop" style={shift(-4, -2)}>
            <circle cx="1100" cy="170" r="170" fill="url(#lang-quang)" />
            <g transform="translate(1100 170)">
              <g className="trong-dong">
                <circle r="64" className="f-sun" />
                <circle r="56" fill="none" className="s-ring" strokeWidth="1.4" />
                <circle r="49" fill="none" className="s-ring" strokeWidth="5" strokeDasharray="1.5 4" />
                <circle r="40" fill="none" className="s-ring" strokeWidth="2.4" strokeDasharray="7 5" />
                <circle r="31" fill="none" className="s-ring" strokeWidth="1.2" />
                <polygon className="f-ring" points="26,0 11.59,3.11 22.52,13 8.49,8.49 13,22.52 3.11,11.59 0,26 -3.11,11.59 -13,22.52 -8.49,8.49 -22.52,13 -11.59,3.11 -26,0 -11.59,-3.11 -22.52,-13 -8.49,-8.49 -13,-22.52 -3.11,-11.59 0,-26 3.11,-11.59 13,-22.52 8.49,-8.49 22.52,-13 11.59,-3.11" />
              </g>
            </g>
          </g>

          {/* đàn chim */}
          <g className="dan-chim" opacity=".75">
            <g transform="translate(0 150)"><path className="canh s-soft" d="M0 0 q7 -7 14 0 q7 -7 14 0" fill="none" strokeWidth="1.8" strokeLinecap="round" /></g>
            <g transform="translate(38 132)"><path className="canh s-soft" style={{ animationDelay: ".3s" }} d="M0 0 q6 -6 12 0 q6 -6 12 0" fill="none" strokeWidth="1.6" strokeLinecap="round" /></g>
            <g transform="translate(66 158)"><path className="canh s-soft" style={{ animationDelay: ".6s" }} d="M0 0 q5 -5 10 0 q5 -5 10 0" fill="none" strokeWidth="1.4" strokeLinecap="round" /></g>
          </g>

          {/* đê sông Hồng và làng xa */}
          <g className="lop" style={shift(-8)}>
            <path className="f-hill-far" d="M-40 372 C 160 342 300 352 440 360 C 620 372 780 338 940 346 C 1120 356 1270 334 1480 348 V 640 H -40 Z" />
            <path className="f-hill-near" opacity=".6" d="M210 352 l10 -14 l10 14 z M560 362 l8 -12 l8 12 z M1240 344 l9 -13 l9 13 z" />
          </g>

          {/* làng: nhà ngói, lò bầu, đình */}
          <g className="lop" style={shift(-16)}>
            <path className="f-hill-near" d="M-40 446 C 180 420 420 432 640 428 C 880 424 1100 414 1480 432 V 640 H -40 Z" />
            <House x={150} y={392} w={120} h={50} />
            <House x={312} y={384} w={150} h={58} />
            {/* lò bầu */}
            <path className="f-roof" d="M512 444 V404 C512 382 532 372 544 364 V312 H564 V364 C576 372 596 382 596 404 V444 Z" />
            <path className="f-fire lua-lo" d="M540 444 V426 a14 14 0 0 1 28 0 V444 Z" />
            <Smoke cx={554} cy={300} delays={[0, 2.5, 5]} />
            <House x={632} y={390} w={132} h={52} />
            {/* lò hộp ống khói cao */}
            <rect className="f-roof" x="782" y="384" width="112" height="60" />
            <rect className="f-roof-2" x="824" y="270" width="24" height="120" />
            <path className="f-roof" d="M820 270 h32 v-6 h-32 z" />
            <path className="f-fire lua-lo" style={{ animationDelay: "1.1s" }} d="M812 444 V428 a10 10 0 0 1 20 0 V444 Z M846 444 V428 a10 10 0 0 1 20 0 V444 Z" />
            <Smoke cx={836} cy={256} delays={[1.2, 3.8, 6.2]} />
            {/* đình làng */}
            <rect className="f-wall" x="950" y="380" width="200" height="62" />
            <path className="f-roof" d="M926 388 L960 338 H1140 L1174 388 Q1050 374 926 388 Z" />
            <path fill="url(#lang-ngoi)" opacity=".55" d="M926 388 L960 338 H1140 L1174 388 Q1050 374 926 388 Z" />
            <path className="s-roof" fill="none" strokeWidth="4" strokeLinecap="round" d="M960 338 q-10 -6 -8 -18 M1140 338 q10 -6 8 -18 M1036 338 q14 -14 28 0" />
            <rect className="f-roof-2" x="968" y="398" width="16" height="44" />
            <rect className="f-roof-2" x="1116" y="398" width="16" height="44" />
            <rect className="f-roof-2" x="1024" y="396" width="52" height="46" />
            <House x={1204} y={394} w={120} h={48} />
            {/* lò bầu nhỏ */}
            <path className="f-roof" d="M1352 444 V410 C1352 394 1366 386 1374 380 V340 H1390 V380 C1398 386 1412 394 1412 410 V444 Z" />
            <path className="f-fire lua-lo" style={{ animationDelay: ".6s" }} d="M1372 444 V430 a10 10 0 0 1 20 0 V444 Z" />
            <Smoke cx={1382} cy={328} delays={[0.9, 4.4]} />
            {/* đèn lồng đêm hội */}
            <g className="lop-den">
              {[[200, 362, 0], [387, 350, 0.7], [1000, 340, 1.3], [1100, 340, 0.3], [1264, 364, 1.8]].map(([x, y, d]) => (
                <g key={x} className="den-lac" style={{ animationDelay: `${d}s` }}>
                  <path d={`M${x} ${y} v7`} stroke="#5a3323" strokeWidth="1.2" />
                  <ellipse cx={x} cy={y + 15} rx="6.5" ry="8.5" fill="#d9502e" />
                  <circle cx={x} cy={y + 15} r="17" fill="#ffb56b" opacity=".25" />
                </g>
              ))}
            </g>
          </g>

          {/* sông, sóng mây, thuyền xa */}
          <g className="lop" style={shift(-10, -3)}>
            <rect x="-40" y="470" width="1520" height="180" fill="url(#lang-nuoc)" />
            <g className="song"><rect x="-40" y="486" width="1760" height="160" fill="url(#lang-may-song)" /></g>
            <g className="song-2" opacity=".6"><rect x="-280" y="512" width="1760" height="140" fill="url(#lang-may-song)" /></g>
            <ellipse className="lap-lanh f-sun" cx="1100" cy="500" rx="60" ry="3" opacity=".6" />
            <ellipse className="lap-lanh f-sun" style={{ animationDelay: "1s" }} cx="1090" cy="516" rx="40" ry="2.5" opacity=".5" />
            <ellipse className="lap-lanh f-sun" style={{ animationDelay: "2s" }} cx="1112" cy="532" rx="26" ry="2" opacity=".4" />
            <g className="thuyen-xa">
              <g transform="translate(0 482)">
                <path className="f-roof-2" d="M0 10 Q40 22 80 10 L72 18 Q40 26 8 18 Z" />
                <path className="f-wall" opacity=".9" d="M40 10 V-34 L66 2 Z" />
              </g>
            </g>
          </g>

          {/* bến gạch và vò men */}
          <g className="lop" style={shift(-28, -8)}>
            <path className="f-wall" d="M-40 528 H190 L246 640 H-40 Z" />
            <path className="s-roof" strokeWidth="2" opacity=".35" d="M-40 552 H202 M-40 578 H214 M-40 604 H226" />
            <path fill="#1f4e9a" d="M44 530 C 36 512 38 494 52 486 V478 H68 V486 C 82 494 84 512 76 530 Z" />
            <path stroke="#fffdf8" strokeWidth="2" opacity=".7" d="M46 508 h28" />
            <path fill="#a34a23" d="M96 530 C 90 518 92 506 104 500 H124 C 136 506 138 518 132 530 Z" />
            <path fill="#3b6f5e" d="M140 530 C 136 520 140 510 150 506 V500 H162 V506 C 172 510 176 520 172 530 Z" />
          </g>

          {/* khóm tre hai bên */}
          <g className="lop" style={shift(-28, -8)}>
            <g className="tre">
              <path className="s-bamboo" fill="none" strokeWidth="4" strokeLinecap="round" d="M18 640 C 14 520 22 420 10 300 M34 640 C 34 540 44 440 46 330 M52 640 C 58 560 70 470 86 380" />
              <path className="s-bamboo" fill="none" strokeWidth="7" strokeLinecap="round" opacity=".85" d="M10 300 q18 4 30 -10 M46 330 q-20 -2 -30 -18 M86 380 q16 -10 18 -28 M28 420 q-18 -6 -26 -24 M64 470 q18 -4 26 -20" />
            </g>
            <g className="tre" style={{ animationDelay: "1.4s" }}>
              <path className="s-bamboo" fill="none" strokeWidth="4" strokeLinecap="round" d="M1424 640 C 1428 520 1418 420 1430 300 M1406 640 C 1404 540 1396 450 1392 340 M1388 640 C 1380 560 1366 480 1350 400" />
              <path className="s-bamboo" fill="none" strokeWidth="7" strokeLinecap="round" opacity=".85" d="M1430 300 q-18 4 -30 -10 M1392 340 q20 -2 30 -18 M1350 400 q-16 -10 -18 -28 M1412 430 q18 -6 26 -24" />
            </g>
          </g>
        </svg>

        {/* thuyền chở gốm thật: ảnh tác phẩm men ngọc đã tách nền */}
        <div className="lop absolute bottom-[18px] left-[56%] w-[180px] md:bottom-[46px] md:left-[63%] md:w-[260px]" style={shift(-22, -6)}>
          <div className="thuyen relative aspect-[260/150]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/seed/cutout/ngoc-jar.webp" alt="" className="absolute bottom-[23%] left-[22%] h-[64%] w-[30%] object-contain object-bottom" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/seed/cutout/ngoc-bowl.webp" alt="" className="absolute bottom-[23%] left-[52%] h-[37%] w-[29%] object-contain object-bottom" />
            <svg viewBox="0 0 260 60" className="absolute bottom-0 left-0 w-full">
              <path className="f-roof-2" d="M4 18 Q130 40 256 18 L238 40 Q130 58 22 40 Z" />
              <path className="s-roof" fill="none" strokeWidth="3" d="M18 22 Q130 42 242 22" />
              <path stroke="#7a4632" strokeWidth="3" strokeLinecap="round" d="M200 20 L246 -6" />
            </svg>
          </div>
        </div>
      </div>

      {/* lời chào */}
      <div className="relative md:h-full">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-6 px-4 pb-8 pt-6 md:px-6 md:pt-16">
          <div className="gan-vien max-w-2xl">
            {heading}
            <div className="mt-4 max-w-xl text-[1.2rem] leading-[1.5] text-[var(--hero-soft)] md:text-[1.35rem]">{lead}</div>
            {actions && <div className="mt-6 flex flex-wrap gap-2.5">{actions}</div>}
          </div>
          {aside && <div className="gan-vien md:mt-[210px]" style={{ animationDelay: ".25s" }}>{aside}</div>}
        </div>
      </div>
    </section>
  );
}

function House({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const roof = `M${x - 16} ${y + 6} L${x + 8} ${y - 30} H${x + w - 8} L${x + w + 16} ${y + 6} Q${x + w / 2} ${y - 4} ${x - 16} ${y + 6} Z`;
  return (
    <g>
      <rect className="f-wall" x={x} y={y} width={w} height={h} />
      <path className="f-roof" d={roof} />
      <path fill="url(#lang-ngoi)" opacity=".55" d={roof} />
      <rect className="f-window" x={x + 16} y={y + 14} width="18" height="14" />
      <rect className="f-roof-2" x={x + w / 2 - 11} y={y + 18} width="22" height={h - 18} />
      <rect className="f-window" x={x + w - 34} y={y + 14} width="18" height="14" />
    </g>
  );
}

function Smoke({ cx, cy, delays }: { cx: number; cy: number; delays: number[] }) {
  return (
    <>
      {delays.map((d, i) => (
        <circle key={d} className="khoi f-smoke" cx={cx} cy={cy} r={9 + (i % 2) * 3} style={{ animationDelay: `${d}s` }} />
      ))}
    </>
  );
}
