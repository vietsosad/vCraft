"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Flame } from "lucide-react";
import type { ProductionStage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { KilnGauge } from "./kiln-gauge";

/** Nhiệt độ ước lượng cho mốc không ghi nhiệt (đất, phơi, vẽ… ở nhiệt độ phòng). */
const AMBIENT = 28;

/**
 * Dòng thời gian "Mạch lửa lò nung". Trên màn rộng chia hai cột: cột trái là đồng hồ nhiệt lò cỡ lớn
 * dính theo khi cuộn (kim chạy có quán tính như đồng hồ thật) cùng sổ lò liệt kê các công đoạn;
 * cột phải là các mốc nhật ký có ảnh thật. Trên điện thoại đồng hồ thu thành thanh nhiệt dính trên đầu.
 */
export function KilnTimeline({ stages, startDate }: { stages: ProductionStage[]; startDate: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const color = useTransform(progress, [0, 0.5, 1], ["#b9a88c", "#a34a23", "#ee8a43"]);
  const start = Date.parse(startDate);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [stages.length]);

  const current = stages[active];
  const temp = current?.temperatureC ?? AMBIENT;
  const dayOf = (s: ProductionStage) => Math.max(1, Math.round((Date.parse(s.occurredAt) - start) / 86400000) + 1);

  return (
    <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
      {/* Cột trái: đồng hồ nhiệt + sổ lò */}
      <aside className="hidden md:block" aria-label="Đồng hồ nhiệt lò">
        <div className="sticky top-[calc(6.5rem+var(--demo-h))] space-y-4">
          <KilnGauge temp={temp} stage={current?.title ?? ""} step={active + 1} total={stages.length} className="p-5 [&_svg]:max-w-[300px]" />
          <ol className="tile bg-su p-2 text-sm">
            {stages.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => items.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[5px] px-3 py-2 text-left transition-colors",
                    active === i ? "bg-datnung-nhat text-muc" : "text-tro hover:bg-nga-dam hover:text-muc",
                  )}
                  aria-current={active === i ? "step" : undefined}
                >
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-[4px] text-[11px] font-bold", i <= active ? "bg-datnung-nen text-giay" : "bg-nga-sau text-tro")}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <span className="shrink-0 text-xs tabular">{s.temperatureC ? `${formatNumber(s.temperatureC)}°C` : `ngày ${dayOf(s)}`}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      {/* Cột phải: các mốc nhật ký */}
      <div className="relative min-w-0">
        <div className="sticky top-[calc(76px+var(--demo-h))] z-20 mb-8 md:hidden">
          <KilnGauge variant="bar" temp={temp} stage={current?.title ?? ""} step={active + 1} total={stages.length} />
        </div>
        <div className="absolute bottom-0 left-5 top-0 w-[3px] rounded bg-nga-sau" aria-hidden />
        <motion.div
          className="absolute left-5 top-0 w-[3px] origin-top rounded"
          style={{ scaleY: progress, backgroundColor: color, height: "100%", boxShadow: "0 0 18px rgba(238,138,67,.5)" }}
          aria-hidden
        />
        <ol className="space-y-16 md:space-y-20">
          {stages.map((s, i) => {
            const fire = s.temperatureC && s.temperatureC >= 1000;
            return (
              <li key={s.id} ref={(el) => { items.current[i] = el; }} data-index={i} className="relative">
                <span
                  className={cn(
                    "absolute left-5 top-2 z-10 grid size-10 -translate-x-1/2 place-items-center rounded-[7px] border-[3px] border-nga text-xs font-bold text-giay shadow-soft transition-transform duration-500",
                    s.isAddendum ? "bg-lam-nen" : fire ? "bg-[#c4602a]" : "bg-datnung-nen",
                    active === i && "scale-110",
                  )}
                >
                  {fire ? <Flame className="size-4" aria-hidden /> : i + 1}
                </span>
                <div data-reveal style={{ ["--rot" as string]: "0deg", ["--tx" as string]: "16px", ["--ty" as string]: "20px" }} className="ml-14">
                  <p className="text-xs font-semibold text-datnung">
                    {s.isAddendum ? "Ghi chú bổ sung" : `Ngày thứ ${dayOf(s)}`} · {formatDate(s.occurredAt)}
                    {s.temperatureC ? ` · ${formatNumber(s.temperatureC)}°C` : ""}
                  </p>
                  <h3 className="mt-2 text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-[60ch] leading-relaxed text-muc/80">{s.description}</p>
                  {s.images.length > 0 && (
                    <div className={cn("mt-5 grid gap-2", s.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                      {s.images.slice(0, 4).map((img, j) => (
                        <figure key={img.src + j}>
                          <div className="tile">
                            <VImage image={img} ratio={s.images.length > 1 ? "1/1" : "16/10"} sizes="(max-width: 768px) 80vw, 30vw" />
                          </div>
                          <figcaption className="mt-1 text-[11px] text-tro">{img.alt}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                  {s.recordedAt && <p className="mt-2 text-[11px] text-tro">Ghi nhận lúc {formatDate(s.recordedAt, true)}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
