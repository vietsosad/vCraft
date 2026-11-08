"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Flame } from "lucide-react";
import type { ProductionStage } from "@/lib/types";
import { VImage } from "@/components/ui/vimage";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Dòng thời gian "Mạch lửa lò nung": đường chỉ giữa đổi màu từ xám đất sét → đỏ gạch → vàng lửa
 * theo tiến độ cuộn; mỗi mốc hiện dần với ảnh minh chứng thật tại xưởng.
 */
export function KilnTimeline({ stages, startDate }: { stages: ProductionStage[]; startDate: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const color = useTransform(progress, [0, 0.5, 1], ["#a8a29a", "#B84A39", "#FA903E"]);
  const start = Date.parse(startDate);

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl">
      <div className="absolute bottom-0 left-5 top-0 w-[3px] rounded bg-bisque-deep md:left-1/2 md:-ml-[1.5px]" aria-hidden />
      <motion.div
        className="absolute left-5 top-0 w-[3px] origin-top rounded md:left-1/2 md:-ml-[1.5px]"
        style={{ scaleY: progress, backgroundColor: color, height: "100%", boxShadow: "0 0 18px rgba(250,144,62,.55)" }}
        aria-hidden
      />
      <ol className="space-y-16 md:space-y-24">
        {stages.map((s, i) => {
          const day = Math.max(1, Math.round((Date.parse(s.occurredAt) - start) / 86400000) + 1);
          const left = i % 2 === 0;
          return (
            <li key={s.id} className="relative">
              <span
                className={cn(
                  "absolute left-5 top-2 z-10 grid size-10 -translate-x-1/2 place-items-center rounded-full border-4 border-kaolin font-mono text-xs text-kaolin md:left-1/2",
                  s.isAddendum ? "bg-cobalt" : s.temperatureC && s.temperatureC >= 1000 ? "bg-kiln" : "bg-terracotta",
                )}
              >
                {s.temperatureC && s.temperatureC >= 1000 ? <Flame className="size-4" /> : String(i + 1).padStart(2, "0")}
              </span>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn("ml-14 md:ml-0 md:w-[calc(50%-48px)]", left ? "md:mr-auto md:text-right" : "md:ml-auto")}
              >
                <p className="font-mono text-xs uppercase tracking-widest text-terracotta">
                  {s.isAddendum ? "Ghi chú bổ sung" : `Ngày thứ ${day}`} · {formatDate(s.occurredAt)}
                  {s.temperatureC ? ` · ${formatNumber(s.temperatureC)}°C` : ""}
                </p>
                <h3 className="mt-2 text-3xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/75">{s.description}</p>
                {s.images.length > 0 && (
                  <div className={cn("mt-5 grid gap-2", s.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {s.images.slice(0, 4).map((img, j) => (
                      <figure key={img.src + j}>
                        <VImage image={img} ratio={s.images.length > 1 ? "1/1" : "16/10"} sizes="(max-width: 768px) 80vw, 30vw" className="rounded-[var(--radius-tile)]" />
                        <figcaption className="mt-1 text-[11px] text-ash">{img.alt}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
                {s.recordedAt && <p className="mt-2 font-mono text-[10px] text-ash/70">Ghi nhận lúc {formatDate(s.recordedAt, true)}</p>}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
