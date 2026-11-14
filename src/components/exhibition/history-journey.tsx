"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, transform, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { MediaImage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { Crescent, DrumFace, Sampan, WaveLayer } from "@/components/motion/ornaments";
import { cn } from "@/lib/cn";

/** Một chặng của hành trình. `ground: "page"` nghĩa là dùng đúng màu nền trang (sáng hoặc tối theo chế độ). */
export type Era = {
  era: string;
  /** thời khắc trong "một ngày trên sông" */
  time: string;
  title: string;
  body: string;
  image: MediaImage | null;
  caption: string;
  ground: string;
  /** màu trung gian khi chuyển TỪ chặng trước sang chặng này (tránh hai màu đối nhau pha thành tím đục) */
  via?: string;
  ink: "light" | "dark" | "page";
  accent: string;
};

const LIGHT = "#fffdf8";
const DARK = "#1c1a17";

function luminance(hex: string) {
  const m = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Dựng các hàm ánh xạ tiến độ → màu.
 * - Nền: mỗi chặng giữ nguyên màu của mình quanh tâm (30% đầu và 30% cuối mỗi quãng), chỉ chuyển ở 40% giữa;
 *   nếu chặng sau khai báo `via` thì đi qua màu trung gian đó ở chính giữa.
 * - Chữ và màu nhấn: không nội suy thẳng (sẽ có lúc xám trên xám) mà đổi nhanh đúng lúc nền vượt ngưỡng sáng/tối.
 */
function buildColorMaps(stops: number[], grounds: string[], vias: (string | undefined)[], inks: string[], accents: string[]) {
  const gPos: number[] = [];
  const gOut: string[] = [];
  const pos: number[] = [];
  const inkOut: string[] = [];
  const accOut: string[] = [];
  const last = stops.length - 1;
  for (let i = 0; i <= last; i++) {
    gPos.push(stops[i]);
    gOut.push(grounds[i]);
    pos.push(stops[i]);
    inkOut.push(inks[i]);
    accOut.push(accents[i]);
    if (i === last) break;
    const at = (f: number) => lerp(stops[i], stops[i + 1], f);
    gPos.push(at(0.3));
    gOut.push(grounds[i]);
    const via = vias[i + 1];
    if (via) {
      gPos.push(at(0.5));
      gOut.push(via);
    }
    gPos.push(at(0.7));
    gOut.push(grounds[i + 1]);
    if (inks[i] !== inks[i + 1]) {
      const brighter = luminance(grounds[i + 1]) > luminance(grounds[i]);
      const [f1, f2] = brighter ? [0.4, 0.46] : [0.54, 0.6];
      pos.push(at(f1), at(f2));
      inkOut.push(inks[i], inks[i + 1]);
      accOut.push(accents[i], accents[i + 1]);
    } else {
      pos.push(at(0.3), at(0.7));
      inkOut.push(inks[i], inks[i + 1]);
      accOut.push(accents[i], accents[i + 1]);
    }
  }
  return { ground: transform(gPos, gOut), ink: transform(pos, inkOut), accent: transform(pos, accOut) };
}

/**
 * "Xuôi dòng sông Cái": một ngày trôi trên sông là sáu thế kỷ của làng.
 * Trên màn rộng đây là đoạn cuộn dính – cuộn dọc thì cuộn tranh trượt ngang. Nền đổi màu liền mạch theo thời khắc
 * (trước bình minh → trưa → đêm → sáng nay), bắt đầu và kết thúc bằng đúng màu nền trang nên không có đường cắt.
 * Mặt trống đồng Đông Sơn là mặt trời đi một vòng cung qua bầu trời; con thuyền nan chạy trên sóng báo tiến độ.
 * Màn hẹp hoặc người dùng giảm chuyển động: các chặng xếp dọc, nền vẫn đổi màu theo cuộn.
 */
export function HistoryJourney({ intro, eras }: { intro: { image: MediaImage | null; caption: string }; eras: Era[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const ticks = useRef<HTMLOListElement>(null);
  const size = useRef({ vw: 1440, vh: 900 });
  const count = eras.length + 1;
  const [pinned, setPinned] = useState(false);
  const [distance, setDistance] = useState(0);
  const [stops, setStops] = useState<number[]>(() => Array.from({ length: count }, (_, i) => i / (count - 1)));
  const [tickX, setTickX] = useState<number[]>(() => Array.from({ length: count }, (_, i) => 100 + i * 120));
  const [page, setPage] = useState({ ground: "#f7f2e8", ink: DARK, accent: "#a34a23" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const measure = () => {
      const tr = track.current;
      const sec = section.current;
      if (!tr || !sec) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      size.current = { vw, vh };
      const isPinned = mq.matches;
      const panels = [...tr.querySelectorAll<HTMLElement>("[data-panel]")];
      let raw: number[];
      if (isPinned) {
        const dist = Math.max(1, tr.scrollWidth - vw);
        setDistance(dist);
        raw = panels.map((el) => clamp01((el.offsetLeft + el.offsetWidth / 2 - vw / 2) / dist));
      } else {
        const total = Math.max(1, sec.offsetHeight - vh);
        raw = panels.map((el) => clamp01((el.offsetTop + el.offsetHeight / 2 - vh / 2) / total));
      }
      // bảo đảm tăng dần nghiêm ngặt (hai chặng trùng vị trí sẽ làm phép nội suy chia cho 0)
      const strict = raw.map((v, i) => v + i * 1e-4);
      for (let i = 1; i < strict.length; i++) if (strict[i] <= strict[i - 1]) strict[i] = strict[i - 1] + 1e-4;
      setStops(strict);
      setPinned(isPinned);
      if (ticks.current) {
        setTickX([...ticks.current.children].map((li) => (li as HTMLElement).offsetLeft + (li as HTMLElement).offsetWidth / 2));
      }
      const cs = getComputedStyle(document.documentElement);
      const read = (name: string, fallback: string) => {
        const v = cs.getPropertyValue(name).trim();
        return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
      };
      setPage({ ground: read("--color-nga", "#f7f2e8"), ink: read("--color-muc", DARK), accent: read("--color-datnung", "#a34a23") });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    const themeWatch = new MutationObserver(measure);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      themeWatch.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress: progress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const maps = useMemo(() => {
    const grounds = [page.ground, ...eras.map((e) => (e.ground === "page" ? page.ground : e.ground))];
    const inks = [page.ink, ...eras.map((e) => (e.ink === "page" ? page.ink : e.ink === "light" ? LIGHT : DARK))];
    const accents = [page.accent, ...eras.map((e) => (e.ink === "page" ? page.accent : e.accent))];
    const vias = [undefined, ...eras.map((e) => e.via)];
    return buildColorMaps(stops, grounds, vias, inks, accents);
  }, [stops, eras, page]);

  const ground = useTransform(progress, (p) => maps.ground(p));
  const ink = useTransform(progress, (p) => maps.ink(p));
  const accent = useTransform(progress, (p) => maps.accent(p));
  const x = useTransform(progress, (p) => -p * distance);

  // Mặt trời (mặt trống đồng): mọc bên trái, lên đỉnh, lặn bên phải; đêm khuất; rạng đông mọc lại
  const sunX = useTransform(progress, (p) => {
    const { vw } = size.current;
    return p < 0.72 ? lerp(0.02, 0.86, clamp01((p - 0.04) / 0.68)) * vw : lerp(0.04, 0.3, clamp01((p - 0.86) / 0.14)) * vw;
  });
  const sunY = useTransform(progress, (p) => {
    const { vh } = size.current;
    const horizon = vh * 0.66;
    if (p < 0.72) return horizon - Math.sin(Math.PI * clamp01((p - 0.04) / 0.68)) * vh * 0.6;
    return horizon - Math.sin((Math.PI / 2) * clamp01((p - 0.86) / 0.14)) * vh * 0.42;
  });
  const sunOpacity = useTransform(progress, [0, 0.06, 0.62, 0.72, 0.86, 0.94, 1], [0, 0.22, 0.22, 0, 0, 0.2, 0.16]);
  const sunRotate = useTransform(progress, [0, 1], [0, 200]);
  const moonOpacity = useTransform(progress, [0.66, 0.74, 0.82, 0.9], [0, 0.85, 0.85, 0]);
  const moonY = useTransform(progress, [0.66, 0.78, 0.9], [60, 0, 40]);
  const waveX = useTransform(progress, (p) => -p * 420);
  const boatX = useTransform(progress, (p) => transform(stops, tickX)(p));

  useMotionValueEvent(progress, "change", (p) => {
    let best = 0;
    for (let i = 0; i < stops.length; i++) if (Math.abs(stops[i] - p) < Math.abs(stops[best] - p)) best = i;
    setActive(best);
  });

  const span = 1 / Math.max(1, count - 1);
  const labels = ["Nhổ neo", ...eras.map((e) => e.time)];

  return (
    <section
      ref={section}
      id="hanh-trinh"
      data-chapter="Sáu thế kỷ"
      aria-label="Xuôi dòng sông Cái: sáu thế kỷ làng gốm Bát Tràng"
      className="relative"
      style={pinned ? { height: `calc(100vh + ${Math.round(distance * 0.9)}px)` } : undefined}
    >
      <motion.div
        style={{ backgroundColor: ground, color: ink, ["--accent" as string]: accent }}
        className={cn("relative overflow-hidden", pinned && "sticky top-[var(--demo-h)] h-[calc(100vh-var(--demo-h))]")}
      >
        {/* Mặt trời – mặt trống đồng */}
        {pinned && (
          <motion.div style={{ x: sunX, y: sunY, opacity: sunOpacity, rotate: sunRotate }} className="pointer-events-none absolute left-0 top-0 -ml-[21vh] -mt-[21vh] size-[42vh] text-[color:var(--accent)]">
            <DrumFace className="size-full" />
          </motion.div>
        )}
        {pinned && (
          <motion.div style={{ opacity: moonOpacity, y: moonY }} className="pointer-events-none absolute right-[12vw] top-[9vh] text-[color:var(--accent)]">
            <Crescent className="size-[9vh]" />
          </motion.div>
        )}

        <motion.div
          ref={track}
          style={pinned ? { x } : undefined}
          className={cn("relative flex", pinned ? "h-full items-center pb-[17vh] will-change-transform" : "flex-col gap-20 px-4 py-24 md:px-6")}
        >
          {/* Chặng mở: nhổ neo */}
          <div data-panel className={cn("shrink-0", pinned ? "flex w-[88vw] items-center gap-[5vw] pl-[6vw]" : "grid gap-8")}>
            <div className={cn(pinned && "w-[40vw] shrink-0")}>
              <h2 className="font-display text-[clamp(3rem,6.4vw,6.4rem)] uppercase leading-[0.9]">
                Xuôi dòng
                <br />
                <span className="text-[color:var(--accent)]">sông Cái</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed opacity-80">
                Một ngày trôi trên sông là sáu thế kỷ của làng: từ men ngọc, hoa nâu thời Lý – Trần tới con đường gốm sứ hôm nay.
                {pinned ? " Cuộn xuống để nhổ neo." : ""}
              </p>
            </div>
            <figure className={cn("relative", pinned ? "w-[36vw] -rotate-2" : "max-w-xl")}>
              <div className="tile">
                <VImage image={intro.image} ratio="4/3" sizes="(max-width: 900px) 100vw, 36vw" />
              </div>
              <figcaption className="mt-3 max-w-sm text-xs leading-snug opacity-70">{intro.caption}</figcaption>
            </figure>
          </div>

          {eras.map((e, i) => (
            <EraPanel key={e.era} era={e} stop={stops[i + 1] ?? 1} span={span} progress={progress} pinned={pinned} />
          ))}
          {pinned && <div className="w-[10vw] shrink-0" aria-hidden />}
        </motion.div>

        {/* Sông Cái: ba lớp sóng, con thuyền và các mốc thời khắc */}
        {pinned && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[17vh]">
            <motion.div style={{ x: waveX }} className="absolute -inset-x-[460px] top-[1.4vh] h-12 opacity-25"><WaveLayer className="size-full" amplitude={7} strokeWidth={1.4} duration={26} /></motion.div>
            <motion.div style={{ x: boatX }} className="absolute left-0 top-0 -ml-[4.5vh] -mt-[5.2vh] w-[9vh] text-[color:var(--accent)]">
              <Sampan className="boat-bob w-full" />
            </motion.div>
            <motion.div style={{ x: waveX }} className="absolute -inset-x-[460px] top-[3.6vh] h-12 opacity-45"><WaveLayer className="size-full" amplitude={10} strokeWidth={2} duration={18} /></motion.div>
            <div className="absolute inset-x-0 top-[6vh] h-12 opacity-70"><WaveLayer className="size-full" amplitude={12} strokeWidth={2.6} duration={12} /></div>
            <ol ref={ticks} className="absolute inset-x-[5vw] bottom-[1.6vh] flex" aria-label="Các chặng của hành trình">
              {labels.map((t, i) => (
                <li key={t + i} className={cn("flex-1 text-center text-[11px] leading-tight transition-opacity duration-500", i === active ? "font-semibold opacity-100" : "opacity-45")}>
                  <span className="block">{t}</span>
                  <span className="block opacity-70">{i === 0 ? "sông Hồng" : eras[i - 1].era}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function EraPanel({ era, stop, span, progress, pinned }: { era: Era; stop: number; span: number; progress: MotionValue<number>; pinned: boolean }) {
  // local: -1 khi chặng còn ở bên phải, 0 khi ở giữa màn hình, +1 khi đã trôi sang trái
  const local = useTransform(progress, (p) => (p - stop) / span);
  const frameScale = useTransform(local, [-1.3, 0, 1.3], [0.82, 1, 0.9]);
  const frameY = useTransform(local, [-1.3, 0, 1.3], [70, 0, -24]);
  const frameRotate = useTransform(local, [-1.3, 0, 1.3], [5, 0, -3]);
  const photoX = useTransform(local, [-1.3, 1.3], ["-7%", "7%"]);
  const textX = useTransform(local, [-1.3, 0, 1.3], [140, 0, -70]);
  const textOpacity = useTransform(local, [-1.05, -0.4, 0.5, 1.1], [0, 1, 1, 0.1]);
  const numeralX = useTransform(local, [-1.3, 1.3], [90, -90]);

  return (
    <article
      data-panel
      data-reveal={pinned ? undefined : ""}
      className={cn("relative shrink-0", pinned ? "flex h-[74%] items-center gap-[4vw] pr-[9vw]" : "grid gap-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:items-center")}
    >
      <motion.figure style={pinned ? { scale: frameScale, y: frameY, rotate: frameRotate } : undefined} className={cn("shrink-0", pinned ? "h-full" : "mx-auto w-full max-w-sm")}>
        <div className={cn("arch relative bg-black/20 shadow-lift ring-1 ring-current/15", pinned ? "h-[calc(100%-2.2rem)] w-[min(28vw,400px)]" : "aspect-[3/4] w-full")}>
          <motion.div style={pinned ? { x: photoX } : undefined} className="absolute -inset-x-[9%] inset-y-0">
            <VImage image={era.image} ratio="auto" sizes="(max-width: 900px) 90vw, 32vw" className="h-full" imgClassName="h-full" />
          </motion.div>
        </div>
        <figcaption className={cn("mt-2 text-[11px] leading-snug opacity-65", pinned && "max-w-[min(28vw,400px)] truncate")} title={era.caption}>{era.caption}</figcaption>
      </motion.figure>
      <motion.div style={pinned ? { x: textX, opacity: textOpacity } : undefined} className={cn(pinned && "w-[min(30vw,440px)]")}>
        <motion.p
          style={pinned ? { x: numeralX } : undefined}
          className="whitespace-nowrap font-display text-[clamp(2.6rem,6vw,6.6rem)] leading-[0.85] text-transparent [-webkit-text-stroke:1.5px_var(--accent)]"
        >
          {era.era}
        </motion.p>
        <h3 className="mt-5 text-[clamp(1.6rem,2.4vw,2.3rem)] leading-tight">{era.title}</h3>
        <p className="mt-4 max-w-[46ch] leading-relaxed opacity-80">{era.body}</p>
        {!pinned && <p className="mt-3 text-xs font-semibold opacity-60">{era.time}</p>}
      </motion.div>
    </article>
  );
}
