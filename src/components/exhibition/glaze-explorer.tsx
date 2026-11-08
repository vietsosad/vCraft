"use client";

import Link from "next/link";
import { useState } from "react";
import type { GlazeType } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { VImage } from "@/components/ui/vimage";
import type { MediaImage } from "@/lib/types";
import { cn } from "@/lib/cn";

/** Khám phá 5 dòng men: chọn một dòng men để xem mô tả và tác phẩm tiêu biểu (không tải lại trang). */
export function GlazeExplorer({ samples }: { samples: Record<GlazeType, { image: MediaImage | null; count: number }> }) {
  const [active, setActive] = useState<GlazeType>("MEN_RAN_CO");
  const g = GLAZES[active];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div>
        <div role="tablist" aria-label="Các dòng men" className="flex flex-wrap gap-2">
          {GLAZE_KEYS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={active === k}
              onClick={() => setActive(k)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                active === k ? "border-ink bg-ink text-kaolin" : "border-line bg-white/60 hover:border-ink/40",
              )}
            >
              <span className="size-3 rounded-full ring-1 ring-white/40" style={{ background: GLAZES[k].color }} />
              {GLAZES[k].label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            className="mt-8"
          >
            <h3 className="text-4xl">{g.label}</h3>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-ink/80">{g.description}</p>
            <p className="mt-4 text-sm text-ash">
              <span className="eyebrow mr-2 !text-celadon">Ứng dụng</span>
              {g.usage}
            </p>
            <Link href={`/products?glaze=${active}`} className="mt-6 inline-flex items-center gap-2 border-b border-terracotta pb-0.5 text-terracotta">
              Xem {samples[active]?.count ?? 0} tác phẩm {g.label.toLowerCase()} →
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <VImage image={samples[active]?.image} ratio="5/4" sizes="(max-width: 1024px) 100vw, 50vw" className="rounded-[var(--radius-tile)] shadow-lift" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
