"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import type { MediaImage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { DrumFace } from "@/components/motion/ornaments";
import { cn } from "@/lib/cn";

export type Era = {
  era: string;
  title: string;
  body: string;
  image?: MediaImage | null;
  caption?: string;
  /** viên men đại diện khi không có ảnh (mốc "Con đường gốm sứ") */
  mosaic?: boolean;
};

const TONES = ["tile-dat", "tile-lam", "tile-ngoc", "tile-ran", "tile-hoavan", "tile-sen"];

/**
 * "Sáu thế kỷ bên sông Cái": đoạn cuộn dính – khi cuộn dọc, dải các mốc lịch sử trượt ngang
 * qua khung nhìn như mở một cuộn tranh. Mặt trống đồng xoay theo, thanh viên gốm phía dưới thắp dần.
 * Màn hẹp hoặc giảm chuyển động: các mốc xếp dọc, mỗi mốc gắn viên khi cuộn tới.
 */
export function HistoryScroll({ eras }: { eras: Era[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
    const measure = () => {
      setPinned(mq.matches);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, (p) => -p * distance);
  const rotate = useTransform(smooth, [0, 1], [0, 140]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.9, 1.08, 0.95]);
  useMotionValueEvent(smooth, "change", (p) => setActive(Math.min(eras.length - 1, Math.round(p * (eras.length - 1)))));

  return (
    <section
      ref={section}
      aria-label="Sáu thế kỷ làng gốm Bát Tràng"
      className="relative bg-dem text-giay"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={cn("relative overflow-hidden", pinned && "sticky top-[var(--demo-h)] h-[calc(100vh-var(--demo-h))]")}>
        {/* Mặt trống đồng xoay chậm theo cuộn */}
        <motion.div style={pinned ? { rotate, scale } : undefined} className="pointer-events-none absolute -right-[18vh] top-1/2 -mt-[45vh] size-[90vh] text-[#f5c9a6] opacity-[0.1]">
          <DrumFace className="size-full" />
        </motion.div>

        <motion.div ref={track} style={pinned ? { x } : undefined} className={cn("relative flex h-full", pinned ? "items-center" : "flex-col gap-12 px-4 py-20 md:px-6")}>
          {/* Lời mở */}
          <div className={cn("shrink-0", pinned ? "w-[42vw] pl-[6vw] pr-[4vw]" : "")}>
            <h2 className="font-display text-[clamp(2.8rem,6vw,6rem)] uppercase leading-[0.92]">
              Sáu thế kỷ
              <br />
              <span className="text-[#f5c9a6]">giữ lửa lò</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-giay/75">
              Bát Tràng bên sông Cái: từ bãi đất sét trắng ven sông tới con đường gốm sứ dài gần bốn cây số. Cuộn xuống để mở cuộn tranh của làng.
            </p>
          </div>

          {eras.map((e) => (
            <article
              key={e.era}
              data-reveal={pinned ? undefined : ""}
              className={cn("relative shrink-0", pinned ? "flex h-[78%] w-[min(72vw,880px)] items-stretch gap-8 pr-[6vw]" : "grid gap-5")}
            >
              <div className={cn("tile relative shrink-0 overflow-hidden", pinned ? "h-full w-[46%]" : "aspect-[4/3] w-full")}>
                {e.mosaic ? (
                  <div className="mosaic absolute inset-0 grid-cols-4 grid-rows-5 rounded-none">
                    {Array.from({ length: 20 }, (_, k) => (
                      <span key={k} className={cn("tile rounded-[3px]", TONES[(k * 7 + 3) % TONES.length])} />
                    ))}
                  </div>
                ) : (
                  <VImage image={e.image} ratio="auto" sizes="(max-width: 900px) 100vw, 34vw" className="h-full" imgClassName="h-full" />
                )}
                {e.caption && <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 text-xs text-white/85">{e.caption}</p>}
              </div>
              <div className={cn("flex flex-col", pinned ? "justify-center" : "")}>
                <p className="font-display text-[clamp(3rem,7vw,7.5rem)] leading-[0.85] text-transparent [-webkit-text-stroke:1.5px_#f5c9a6]">{e.era}</p>
                <h3 className="mt-5 font-serif text-[clamp(1.6rem,2.4vw,2.3rem)] font-bold leading-tight text-giay">{e.title}</h3>
                <p className="mt-4 max-w-[46ch] leading-relaxed text-giay/75">{e.body}</p>
              </div>
            </article>
          ))}
          {pinned && <div className="w-[4vw] shrink-0" aria-hidden />}
        </motion.div>

        {/* Thanh viên gốm: mỗi mốc một viên, thắp dần theo cuộn */}
        {pinned && (
          <ol className="absolute inset-x-[6vw] bottom-6 flex gap-1.5" aria-label="Các mốc">
            {eras.map((e, i) => (
              <li key={e.era} className="flex-1">
                <span className={cn("block h-1.5 rounded-[2px] transition-colors duration-500", i <= active ? "bg-[#f5c9a6]" : "bg-giay/15")} />
                <span className={cn("mt-2 block truncate text-[11px] transition-colors", i === active ? "text-giay" : "text-giay/40")}>{e.era}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
