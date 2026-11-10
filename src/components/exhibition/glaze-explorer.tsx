"use client";

import Link from "next/link";
import { useState } from "react";
import type { GlazeType } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { VImage } from "@/components/ui/vimage";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * Khám phá 5 dòng men: mỗi lựa chọn là một viên men mẫu. Chọn viên nào thì ảnh tác phẩm
 * được "tráng" lại từ trên xuống bằng lớp men đó (clip-path), không tải lại trang.
 */
export function GlazeExplorer({ samples }: { samples: Record<GlazeType, { image: MediaImage | null; count: number }> }) {
  const [active, setActive] = useState<GlazeType>("MEN_RAN_CO");
  const g = GLAZES[active];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div>
        <div role="tablist" aria-label="Các dòng men" className="mosaic grid-cols-5">
          {GLAZE_KEYS.map((k) => {
            const on = active === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={on}
                aria-controls="glaze-panel"
                onClick={() => setActive(k)}
                className={cn("tile glaze flex aspect-square flex-col justify-end p-2 text-left transition-transform duration-300 sm:p-3", on ? "-translate-y-1" : "")}
                style={k === "MEN_RAN_CO" ? { backgroundColor: GLAZES[k].color, backgroundImage: "url(/textures/crackle.svg)", backgroundSize: "160px 160px" } : { background: GLAZES[k].color }}
              >
                <span className={cn("rounded-[3px] px-1.5 py-0.5 text-[11px] font-semibold leading-tight sm:text-xs", on ? "bg-dem text-giay" : "bg-su/85 text-muc")}>{GLAZES[k].short}</span>
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            id="glaze-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="tabpanel"
            className="mt-8"
          >
            <h3 className="font-serif text-4xl font-bold">{g.label}</h3>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-muc/85">{g.description}</p>
            <p className="mt-4 max-w-lg text-sm text-tro"><strong className="font-semibold text-muc">Hợp với:</strong> {g.usage}</p>
            <Link href={`/products?glaze=${active}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-lam underline-offset-4 hover:underline">
              Xem {samples[active]?.count ?? 0} tác phẩm {g.label.toLowerCase()} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="tile relative" style={{ aspectRatio: "5/4" }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, transition: { delay: 0.5, duration: 0.2 } }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <VImage image={samples[active]?.image} ratio="auto" sizes="(max-width: 1024px) 100vw, 50vw" className="h-full" imgClassName="h-full" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
